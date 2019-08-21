# coding=utf-8
# -*- coding: utf-8 -*-

import re
import os
import sys

category_file_name_rule = r'(\+).*?(\.m)'
def get_file_path(root_path, file_list, dir_list):

    dir_or_files = os.listdir(root_path)
    for dir_file in dir_or_files:

        dir_file_path = os.path.join(root_path,dir_file)
        if os.path.isdir(dir_file_path):
            dir_list.append(dir_file_path)
            get_file_path(dir_file_path,file_list,dir_list)

        elif (re.search(category_file_name_rule, dir_file_path)):
			# 只添加分类的实现文件
        	file_list.append(dir_file_path)

def check_file_name(file, func_container):
    fo = open(file)
    str = fo.read()
    fo.close()

    impRule = r'(?<=\n)\@implementation.*?(\n.*?)*\*?(?<=\n)\@end\n'
    funcRule = r'(?<=\n)(\-|\+).*?(\n.*?)*\*?\{'
    blockRule = r'(?<=\n)(\/\*).*?(\n.*?)*\*?(\*\/)'
    returnRule = r'(\-|\+).*?\)'
    noParmFuncRule = r'[\w]+[\ ]*?\:'
    enterAndSpaceFilterRule = r'[\W]*?\:'
    impPart = ''
    impMatch = re.search(impRule, str)
    
    if (impMatch is None):
        impPart = str
    else:
        impPart = impMatch.group()
    noBlockPart = re.sub(blockRule, '', impPart)

    funcList = []
    matchList = []
    re.sub(funcRule, lambda d: matchList.append(
        d), noBlockPart)
    for item in matchList:
        if (item != None):
            funcList.append(item.group().replace('{', ''))

    noReturnValueFuncList = []
    for funcName in funcList:
        funcBody = []
        noParamMatchFuncBody = []
        noReturn = re.sub(returnRule, '', funcName)
    
        filterBody = re.sub(enterAndSpaceFilterRule, ':', noReturn)
        
        rt = re.search(noParmFuncRule, filterBody)
    
        if(rt is None):
            funcBody.append(filterBody)
        else:
            re.sub(noParmFuncRule, lambda d: noParamMatchFuncBody.append(d), filterBody)
            for item in noParamMatchFuncBody:
                if (item != None):
                    funcBody.append(item.group())
    
        noReturnValueFuncList.append(''.join(funcBody))

    # 将方法添加进容器，作为 key，value 为文件名
    for funcName in noReturnValueFuncList:
	    
        if func_container.__contains__(funcName):
            # append name to value array
            func_container[funcName].append(file)
        else:
            valueArray = []
            valueArray.append(file)
            func_container[funcName] = valueArray
    

def check_result(func_container, file_list):
    for file_path in file_list:
        check_file_name(file_path, func_container)
    text_content = ''
    for key,value in func_container.items():
        if (len(value) > 1):
            row = []
            row.append('####'+key+'\n'+'* ')
            row.append('\n* '.join(value)+'\n')
            text_content = text_content + ''.join(row) + '\n'
	# 检查结果，写入文件
    export_file = sys.argv[1]+'/check_result.md'
    fo = open(export_file, 'a')
    fo.write(text_content)
    fo.close()
    print('Check result has been export'+export_file)

class FunctionChecker:
    def __init__(self, root_path):
        self.root_path = root_path
    def start(self):
        print('Start check')
        # 用来存放所有的文件路径
        file_list = []
        # 用来存放所有的目录路径
        dir_list = []
        get_file_path(self.root_path, file_list, dir_list)
        # 遍历 file list 输出方法名 list
        func_container = dict()
        # 检查结果集输出到文件
        check_result(func_container,file_list)

if __name__ == "__main__":
    project_path = sys.argv[1]
    checker = FunctionChecker(project_path)
    checker.start()
