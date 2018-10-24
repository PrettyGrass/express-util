#!/usr/bin/env python
# -*- coding: utf-8 -*-


import logging
import os
import sys

sys.path.append('./Confusion')
import shutil
import re
import FileListUtil
import hashlib
reload(sys)
sys.setdefaultencoding('utf-8')

class Rename:
    def __init__(self):
        self.params = RenameParams()
        self.fileMgr = FileManager(self.params.ignore, self.params.noTextFile)
        self.delegate = None
        self.cmdThread = None

    # 获取命令行参数
    def getParams(self):
        print "脚本名:", sys.argv[0]
        pName = ''
        for i in range(1, len(sys.argv)):
            pValue = sys.argv[i]
            if pValue.find('-') == 0:
                pName = sys.argv[i]
                if pName == '-h':
                    print '''
                    -f 目录
                    -i 要替换的段落
                    -o 用于替换的段落 和-i 一一对应
                    '''
            elif pName == '-f':
                self.params.files.append(pValue)
            elif pName == '-i':
                self.params.oldNames.append(pValue)
            elif pName == '-o':
                self.params.newNames.append(pValue)
            elif pName == '-b':
                self.params.ignore.append(pValue)

    def check(self):
        return self.params.check()

    def startRename(self, usePython=True):

        if usePython:
            self.appendLog(u'使用Python实现重命名')
            dirs = self.params.files
            self.fileMgr.ignore = self.params.ignore
            self.fileMgr.delegate = self
            for dir in dirs:
                self.fileMgr.fileList(dir)
            return

        self.appendLog(u'使用OC实现重命名, 已放弃支持')
        # 以下是 调用 oc 语言实现
        # ps = '--path'
        # for dir in self.params.files:
        #     dir = dir.replace(" ", "\ ")
        #     ps = "%s %s" % (ps, dir)
        #
        # ps = "%s --old" % ps
        # for item in self.params.oldNames:
        #     item = item.replace(" ", "\ ")
        #     ps = "%s %s" % (ps, item)
        #
        # ps = "%s --replace" % ps
        # for item in self.params.newNames:
        #     item = item.replace(" ", "\ ")
        #     ps = "%s %s" % (ps, item)
        #
        # ps = "%s --file-ignore" % ps
        # for item in self.params.ignore:
        #     item = item.replace(" ", "\ ")
        #     ps = "%s %s" % (ps, item)
        #
        # ps = "%s --dir-ignore" % ps
        # for item in self.params.ignore:
        #     item = item.replace(" ", "\ ")
        #     ps = "%s %s" % (ps, item)
        #
        # cPath = sys.argv[0]
        # cmd = u'%s/xcrename %s' % (os.path.dirname(cPath), ps)
        # cmdThread = CMDThread(cmd, self)
        # cmdThread.sub = False
        # cmdThread.start()
        # self.cmdThread = cmdThread

    def ignore(self, filePath, fileName, isDir):
        self.appendLog(u'跳过:%s' % filePath)

    def parse(self, filePath, fileName, isDir, noTextFile):
        if isDir:
            self.parseDir(filePath, fileName)
        else:
            self.parseFile(filePath, fileName, noTextFile)

    def parseFile(self, filePath, fileName, noTextFile):
        if False == noTextFile:
            self.appendLog(u'处理文件:%s' % filePath)
            tmpFile = filePath + '_tmp'
            # print tmpFile
            fi = open(filePath, 'r')
            fo = open(tmpFile, 'w')
            # for line in fi:
            line = fi.read()
            newLine = self.parseLine(line, False)
            fo.writelines(newLine)
            fi.close()
            fo.flush()
            fo.close()

            # filePathMode = oct(os.stat(filePath).st_mode)
            # print '权限1:',  filePathMode
            if FileListUtil.GetFileMd5(tmpFile) != FileListUtil.GetFileMd5(filePath):
                shutil.move(tmpFile, filePath)
            else:
                os.remove(tmpFile)
                # filePathMode = oct(os.stat(filePath).st_mode)
                # print '权限2:', filePathMode
        else:
            self.appendLog(u'处理非文本文件:%s' % filePath)

        self.parseDir(filePath, fileName)

    def parseDir(self, filePath, fileName):
        self.appendLog(u'处理路径:%s' % filePath)
        pDir = os.path.dirname(filePath)
        newFileName = self.parseLine(fileName, False)
        newPath = os.path.join(pDir, newFileName)
        shutil.move(filePath, newPath)

    def parseLine(self, line, flag):

        oldNames = self.params.oldNames
        newNames = self.params.newNames
        protect = self.params.protect
        newLine = line

        # 保护段落
        for x in protect:
            hash = hashlib.md5()
            hash.update(bytes(x))
            enVal = '>>>>%s<<<<' % hash.hexdigest()
            newLine = newLine.replace(x, enVal)

        for x in range(len(oldNames)):
            oName = oldNames[x]
            nName = newNames[x]
            oName = oName.encode("UTF-8")
            nName = nName.encode("UTF-8")
            newLine = newLine.replace(oName, nName)

        # 解除保护段落
        for x in protect:
            hash = hashlib.md5()
            hash.update(bytes(x))
            enVal = '>>>>%s<<<<' % hash.hexdigest()
            newLine = newLine.replace(enVal, x)

        return newLine

    def appendLog(self, line):
        # print line
        if self.delegate != None and self.delegate.appendLog != None:
            self.delegate.appendLog(line)

    # 回调事件
    def start(self, msg):
        self.appendLog(msg)

    def process(self, msg):
        self.appendLog(msg)

    def end(self, msg):
        self.appendLog(msg)
        self.cancel()

    def cancel(self):
        if self.cmdThread != None:
            self.cmdThread.stop()
            self.cmdThread = None


class RenameParams:
    def __init__(self):
        self.files = []
        self.oldNames = []
        self.newNames = []
        self.ignore = ['svn', 'git', 'framework', 'DS_Store', 'Pods']
        self.noTextFile = ['a', 'png', 'jpg']
        self.protect = []

    def removeName(self, idx):
        self.newNames.__delitem__(idx)
        self.oldNames.__delitem__(idx)

    def addName(self, old, new):
        if old == new:
            return 1

        if old in self.oldNames:
            return 2

        if new in self.newNames:
            return 3

        self.oldNames.append(old)
        self.newNames.append(new)
        return 0

    def removeIgnore(self, idx):
        self.ignore.__delitem__(idx)

    def addIgnore(self, name):
        self.ignore.append(name)

    def check(self):

        if len(self.files) == 0:
            print '请输入路径'
            return False

        for path in self.files:
            if os.path.isdir(path) is not True:
                print  '目录不正确 -> %s' % (path)
                return False
            if os.path.isabs(path) is not True:
                print '需使用绝对路径 -> %s' % (path)
                return False

        if len(self.oldNames) != len(self.newNames):
            # raise Exception("修改段落参数异常");
            print "修改段落参数异常"
            return False

        # for item in self.oldNames:
        #     print 'index %d' % self.oldNames.index(item)
        #
        # for item in self.newNames:
        #     print 'index %d' % self.newNames.index(item)
        for x in range(len(self.oldNames)):
            oName = self.oldNames[x]
            nName = self.newNames[x]
            print '%s -> %s' % (oName, nName)

        rep = dict(zip(self.oldNames, self.newNames))
        print '要处理的目录:', '\n'.join(self.files)
        print '处理的内容:', rep
        print '忽略:', '\n'.join(self.ignore)

        return True


class FileManager:
    def __init__(self, ignore, noTextFile):
        # from chardet.universaldetector import UniversalDetector
        # self.detector = UniversalDetector()
        self.ignore = ignore
        self.noTextFile = noTextFile
        self.delegate = None
        pass

    def callParse(self, path, name, isdir, noTextFile):
        if self.delegate != None and self.delegate.parse != None:
            self.delegate.parse(path, name, isdir, noTextFile)

    def callIgnore(self, path, name, isdir):
        if self.delegate != None and self.delegate.ignore != None:
            self.delegate.ignore(path, name, isdir)

    # 递归目录
    def fileList(self, path):

        needIgnore = False
        basename = os.path.basename(path)

        # 匹配文件(夹)是否需要忽略
        if basename in self.ignore:
            needIgnore = True
        else:
            ss = re.split('\.', basename)
            for s in ss:
                if s in self.ignore:
                    needIgnore = True
                    break
        if needIgnore:
            print '跳过:%s' % path
            self.callIgnore(path, os.path.basename(path), os.path.isdir(path))
            return
        # 匹配文件是否是文本类型文件
        noTextFile = False
        if basename in self.noTextFile:
            noTextFile = True
        else:
            ss = re.split('\.', basename)
            l = len(ss)
            if l > 0 and ss[l - 1] in self.noTextFile:
                noTextFile = True

        if os.path.isdir(path):
            list = os.listdir(path)
            for line in list:
                filePath = os.path.join(path, line)
                self.fileList(filePath)
            self.callParse(path, os.path.basename(path), True, True)

        elif os.path.isfile(path):
            self.callParse(path, os.path.basename(path), False, noTextFile)


if __name__ == '__main__':

    rename = Rename()
    rename.getParams()
    if rename.check():
        rename.startRename()
