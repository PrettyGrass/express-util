#!/bin/env python
#-*- encoding=utf8 -*-

import os,sys
import shutil
from PIL import Image  

picturePath = sys.argv[1]
replaceFilePath = sys.argv[2]

#2 替换1 
#遍历当前目录2的文件找到想同的文件并覆盖前面文件夹的图片
#列出目录下的所有文件和目录
def check(file):
    print "开始查找启动图"
    myList = os.listdir(file)
    for picture in myList:
        #文件路径
        filepath = os.path.join(file,picture)
        end = os.path.splitext(filepath)[1];
        if (end == ".png") :
            #获取图片Size
            img = Image.open(filepath)
            rename(picture,img.size)

def rename(fileName,size):
    #替换图片大小
    replaceList = os.listdir(replaceFilePath)
    for replacePicture in replaceList:
        filePath = os.path.join(replaceFilePath,replacePicture)
        print "当前图片名字",replacePicture
        print "原图片名字",fileName

        end = os.path.splitext(filePath)[1];
        if (end == ".png") :
            #获取图片Size
            img = Image.open(filePath)

            width1 = size[0]
            height1 = size[1]
            width2 = img.size[0]
            height2 = img.size[1]
            
            if width1 == width2 and height1 == height2:
                oldDir = filePath
                newDir = os.path.join(replaceFilePath,fileName)
                os.rename(oldDir,newDir)
                print "开始替换文件"
                print "老文件:",oldDir
                print "新文件:",newDir
                shutil.copy(newDir,picturePath)

if __name__ == '__main__':

    print "启动图目录：", picturePath
    print "替换图的目录：", replaceFilePath
    check(picturePath);
