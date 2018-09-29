#!/bin/bash
# author ylin
# date 2018.9.27

echo 'GIT 拉取脚本.' $(date +"%Y.%m.%d %H:%M:%S")
ALL_PARAMS=$*

# 键值类型参数 $1 参数名 $2 默认值
function getParam() {
	NAME=''
	VALUE=''
	for i in $ALL_PARAMS; do
		if [ ${i:0:2} == '--' ]; then
			NAME=${i:2}
			#echo '参数名' $NAME
		elif [[ $1 == $NAME ]]; then
			VALUE=$i
			echo $VALUE
			VALUE=''
			return
		fi
	done
	if [[ $VALUE == '' ]]; then
		echo $2
	fi
}

# 检查开关类型参数
function hasParam() {
	NAME=''
	VALUE=''
	for i in $ALL_PARAMS; do
		if [ ${i:0:2} == '--' ]; then
			if [[ $1 == ${i:2} ]]; then
				echo 1
				return
			fi
		fi
	done
	if [[ $VALUE == '' ]]; then
		echo 0
	fi
}


SELF_DIR=$(cd "$(dirname "$0")"; pwd)
echo '脚本目录:' $SELF_DIR
cd $SELF_DIR

# 显示帮助信息
IS_HELP=$(hasParam help)
if [[ $IS_HELP == 1 ]]; then
	echo '
	脚本使用帮助信息:
	--git-url: git仓库的ssh地址(必选)
	--path: clone 目录(必选), 可以是绝对路径, 也可以是相对于当前脚本的所在目录的相对路径
	--proj-name: 项目目录名(可选, 默认是git仓库名, 无特殊情况不建议设置此项)
	--branch: 分支(必选,可以是分支名, 也可以是提交hash(长/短), 默认master)
	--force-checkout: 强制检出, 重置本地所有未跟踪和未提交(联合开发慎用, 独立开发建议使用)
	--remove-checkout: 先移除再clone
    例子:
    sh ./gitSource.sh --git-url git@g.dou-pai.com:ios_component/AutoPublish.git --path ./AutoPublishDir --force-checkout --branch 1.0.0
	'
	exit 0
fi

WORK_DIR=$(getParam path ../Dependency)
GIT_URL=$(getParam git-url) # git 仓库地址
GIT_BRANCH=$(getParam branch master) # 分支

GIT_NAME=${GIT_URL##*/}
GIT_NAME=${GIT_NAME%%\.*} # 远端git项目名

LOCAL_NAME=$(getParam proj-name $GIT_NAME) # 本地项目名
FORCE_CHECKOUT=$(hasParam force-checkout) # 强制检出开关
REMOVE_CHECKOUT=$(hasParam remove-checkout) # 移除本地开关

# echo $WORK_DIR $GIT_URL $GIT_BRANCH $GIT_NAME $LOCAL_NAME $FORCE_CHECKOUT

if [[ ! -d $WORK_DIR ]]; then
	echo '创建目录:' $WORK_DIR
	mkdir $WORK_DIR
fi

cd $WORK_DIR
PROJ_ROOT=$(pwd)/$LOCAL_NAME

if [[ -d $PROJ_ROOT && $REMOVE_CHECKOUT == 1 ]]; then
	echo '移除目录' $PROJ_ROOT
	rm -rf $PROJ_ROOT/
fi

echo '工作目录:' $(pwd)
if [[ -d "$PROJ_ROOT/.git" ]]; then
	echo '本地git仓库已存在:' $PROJ_ROOT
	cd $PROJ_ROOT
	if [[ $FORCE_CHECKOUT == 1 ]]; then
		git checkout $GIT_BRANCH -f
		git clean -fd
	else 
		git checkout $GIT_BRANCH
	fi
	git pull

else
	echo '本地git仓库不存在:' $PROJ_ROOT
	git clone $GIT_URL
	# 移动目录
	mv $(pwd)/$GIT_NAME $(pwd)/$LOCAL_NAME
	cd $PROJ_ROOT
	git checkout $GIT_BRANCH
fi

echo '完成.' $(date +"%Y.%m.%d %H:%M:%S")



