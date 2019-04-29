#!/bin/sh
# renuxn 2019.4.29

# 当前脚本名
SELF_FILE_NAME=`basename $0`
# 当前脚本路径
SELF_DIR=$(cd "$(dirname "$0")"; pwd)

# 获取ipa名字
function getIpaName() {
    #对IFS变量 进行替换处理
    OLD_IFS="$IFS"
    IFS="/"
    pathArr=($IPA_PATH)
    IFS="$OLD_IFS"
    
    LAST=""
    for var in ${pathArr[@]}
    do
    LAST=$var
    done
    echo ${LAST%.ipa*}
}

# 重签名应用
# 参数1: ipa全路径
# 参数2: 证书名称
# 参数3: 新的描述文件全路径
# 参数4: ipa名称
# 参数5: 重签的ipa名称
# 参数6: 重签包输出路径
function resignApp {
	# ipa路径
    SOURCE_IPA_PATH=$1
    # 证书名称
    CER_NAME=$2
    # 描述文件
	MOB_PATH=$3
    # iap名称
	IPA_NAME=$4
    # 重签名称
    RESIAN_IPA_NAME=$5
    RESIAN_OUTPUT_PATH=$6
    ZIPTARGET_PATH=$RESIAN_OUTPUT_PATH/extracted
    # 解压ipa
    unzip -qo "$SOURCE_IPA_PATH" -d $ZIPTARGET_PATH
    APPLICATION_PATH=$(ls $ZIPTARGET_PATH/Payload)
    # 目标描述文件
    TARGET_MOB_PATH="$ZIPTARGET_PATH/Payload/$APPLICATION_PATH/embedded.mobileprovision"
    # 覆盖原描述文件
    cp "$MOB_PATH" "$TARGET_MOB_PATH"

    # 查找需要过滤的包
    find -d $ZIPTARGET_PATH -name "*.app" -o -name "*.appex" -o -name "*.framework" -o -name "*.dylib" > $RESIAN_OUTPUT_PATH/directories.txt
    # 读取描述文件
    security cms -D -i $TARGET_MOB_PATH > $RESIAN_OUTPUT_PATH/entitlements_full.plist
    # 生成entitlements.plist
    /usr/libexec/PlistBuddy -x -c 'Print:Entitlements' $RESIAN_OUTPUT_PATH/entitlements_full.plist > $RESIAN_OUTPUT_PATH/entitlements.plist
    while read -r line
    do
       /usr/bin/codesign --continue -f -s "$CER_NAME" --entitlements=$RESIAN_OUTPUT_PATH/entitlements.plist $line
    done < $RESIAN_OUTPUT_PATH/directories.txt
    rsGreenPrint "Createing the Signed IPA ..."
    # 打包IPA包
    cd $ZIPTARGET_PATH
    zip -qry ../extracted.ipa *
    cd ..
    RESIGN_IPA_PATH="${RESIAN_OUTPUT_PATH}/${RESIAN_IPA_NAME}.ipa"
    mv extracted.ipa "$RESIGN_IPA_PATH"
    rsGreenPrint "Success: $RESIGN_IPA_PATH"
    #移除多余的文件
    rm -rf "extracted"
    rm directories.txt
    rm entitlements_full.plist
    rm entitlements.plist
}

function rsPrint() {
    echo $1
}

function rsGreenPrint() {
    echo $1
}

# 重签名App
#resignApp
IPA_PATH=$1
DISTRIBUTION_NAME=$2
MOBILEPROV_PATH=$3
OUTPUT_PATH=$4
IPA_NAME=$(getIpaName)
RESIGN_IPA_NAME=$(getIpaName)_resign

rsPrint "====================="
rsPrint "ipa路径: $IPA_PATH"
rsPrint "ipa名称: $IPA_NAME"
rsPrint "证书名称: $DISTRIBUTION_NAME"
rsPrint "描述文件: $MOBILEPROV_PATH"
rsPrint "输出目录: $OUTPUT_PATH"
rsPrint "====================="

rsGreenPrint "开始重签.."
resignApp "$IPA_PATH" "$DISTRIBUTION_NAME" "$MOBILEPROV_PATH" "$IPA_NAME" "$RESIGN_IPA_NAME" "$OUTPUT_PATH"