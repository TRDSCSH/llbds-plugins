//命令注册
mc.regPlayerCmd("post", "§r帖子功能",main);

//常量
const jsonPath = "plugins/post/post.json";
const line = "\n§7__________________________§r\n"
const mainFormButtons = [
    //按钮Label 是否需要op 跳转到功能
    ["新建帖子 >",0,newPost,"textures/ui/icon_book_writable"],
    ["所有帖子 >",0,allPost,"textures/ui/feedIcon"],
    ["我的帖子 >",0,myPost,"textures/ui/mute_off"],
    ["编辑草稿 >",0,editDraft,"textures/ui/editIcon"],
    ["通过 ID 查询帖子 >",1,requireById,"textures/ui/spyglass_flat"],
    ["管理已举报的帖子 >",1,reportMng,"textures/ui/hammer_l"],
    ["发帖设置 >",1,postSettings,"textures/ui/dev_glyph_color"]
];

//初次运行写入配置文件
if (!File.exists(jsonPath)) {
    let defaultJson = '{"postConfig":{"name":"Server","textLimit":100,"titleLimit":35,"postsPerPage":10,"enableCaptcha":false},"posts":[],"draft":[],"report":[]}';
    const postFile = new JsonConfigFile(jsonPath, defaultJson);
}

//主窗体
function main(pl){
    let mainForm = mc.newSimpleForm();
    let isOP = pl.isOP();
    let content = "";
    mainForm.setTitle("帖子");
    mainForm.setContent(content);
    for (let i=0;i < mainFormButtons.length;i++) {
        let label = mainFormButtons[i][0];
        if (mainFormButtons[i][1] == 0) {
            mainForm.addButton(label, mainFormButtons[i][3]);
        } else if (isOP) {
            mainForm.addButton(label, mainFormButtons[i][3]);
        }
    }
    pl.sendForm(mainForm, (pl, id) => {
        if (id != null) {
            switch (id) {
                case id:
                    mainFormButtons[id][2](pl);
            }
        }
    });
}

//所有帖子 窗体
function allPost(pl, page) {
    const postFile = new JsonConfigFile(jsonPath);
    let posts = postFile.get("posts");
    let allPostForm = mc.newCustomForm();
    let postsPerPage = postFile.get("postConfig")["postsPerPage"];
    let postCountOnCtPage = postsPerPage;
    let serverName = postFile.get("postConfig")["name"];
    let controlCount = 0;
    let likeControlList = [];
    if (page == null) page = 1;
    let postCount = 0;
    let pages = [];
    let pageCount = 0;
    let allId = [];
    let idArr = [];
    let allPostText = "";
    // 记录显示的帖子总数
    for (let i=postFile.get("posts").length-1; i>=0; i--) {
        if (postFile.get("posts")[i]["visible"]) {
            postCount++;
            allId.push(String(i));
        }
    }
    if (postCount == 0) {
        let noPostForm = mc.newSimpleForm();
        noPostForm.setTitle("所有帖子");
        noPostForm.setContent("没有找到任何一个帖子...");
        noPostForm.addButton("新建一个帖子 >","textures/ui/mute_off");
        noPostForm.addButton("< 返回","textures/ui/undoArrow");
        pl.sendForm(noPostForm, (pl, id) => {
            if (id != null) {
                switch (id) {
                    case 0:
                        newPost(pl,null,null,"编辑这里的第一个帖子",null,0,1);
                        break;
                    case 1:
                        main(pl);
                }
            }
        });
        return;
    }
    // 计算页码总数
    pageCount = Math.floor((postCount - 1) / postsPerPage) + 1;
    for (let i=1; i<=pageCount; i++) {
        pages.push(String(i));
    }
    if (page > pages.length) {    // 防只有一页时 条被拉到底
        allPost(pl,page-1);
        return;
    }
    // 当前页显示帖子总数
    if (pageCount == page) {
        postCountOnCtPage = (postCount - 1) % postsPerPage + 1;
    }
    allPostForm.setTitle(serverName);
    for (let i=0; i < postCountOnCtPage; i++) {
        let id = parseInt(allId[postsPerPage * (page - 1) + i]);
        let title = postFile.get("posts")[id]["title"];
        let text = postFile.get("posts")[id]["text"];
        let playerName = postFile.get("posts")[id]["playerName"];
        let system = postFile.get("posts")[id]["device"];
        let time = postFile.get("posts")[id]["time"];
        let like = postFile.get("posts")[id]["likedPlayer"].length;
        let postComment = postFile.get("posts")[id]["comment"];
        idArr.push("#" + String(id) + " §r(" + title + "§r)");
        allPostText = `${allPostText}${line}\n§l${title}§r\n${text}\n\n§7附带信息:\n[${playerName}] [${system}] [#${id}]\n[${time}]\n[赞 ${like}]  [评论 ${postComment.length}]§r`
        allPostForm.addLabel(allPostText);
        // 获取是否点赞
        let postId = parseInt(allId[postsPerPage * (page - 1) + i]);
        let likeStatus = false;
        if (posts[postId]["likedPlayer"].indexOf(pl.realName) != -1) likeStatus = true;
        allPostForm.addSwitch("点赞", likeStatus);    // id: 1 3 5 ...
        allPostText = "";
        likeControlList.push(controlCount+1);    // 控件序号
        controlCount = controlCount + 2;
    }
    allPostForm.addStepSlider(`${line}\n\n< 第 ${page} 页，共 ${pageCount} 页 >\n跳转到页码`, pages, page - 1);    // controlCount
    allPostForm.addLabel("\n< 操作 >\n");    // controlCount + 1
    allPostForm.addStepSlider("选择操作", ["无","查看详情","评论","举报","新建帖子"]);    // controlCount + 2
    allPostForm.addStepSlider("选择帖子", idArr);    // controlCount + 3
    pl.sendForm(allPostForm, (pl, data) => {
        if (data != null) {
            const postFile = new JsonConfigFile(jsonPath);
            let posts = postFile.get("posts");
            for (let i=0; i < postCountOnCtPage; i++) {
                let postId = parseInt(allId[postsPerPage * (page - 1) + i]);
                let likeStatus = data[likeControlList[i]];    // 点赞按钮
                let playerName = pl.realName;
                let isLiking = false;    // 原来是否点赞
                if (posts[postId]["likedPlayer"].indexOf(playerName) != -1) isLiking = true;
                if (likeStatus == isLiking) {
                    continue;
                } else {
                    if (isLiking) {
                        // 原来点赞:除名
                        let indexOfPlayer = posts[postId]["likedPlayer"].indexOf(playerName);
                        posts[postId]["likedPlayer"] = [...posts[postId]["likedPlayer"].slice(0,indexOfPlayer), ...posts[postId]["likedPlayer"].slice(indexOfPlayer+1,posts[postId]["likedPlayer"].length)];
                    } else {
                        // 原来未点赞:加名
                        posts[postId]["likedPlayer"].push(playerName); 
                    }
                }
            }
            postFile.set("posts", posts);
            if (data[controlCount] + 1 != page) {
                allPost(pl, data[controlCount] + 1);
            } else {
                let postId = parseInt(allId[postsPerPage * (page - 1) + data[controlCount + 3]]);
                if (isNaN(postId) && data[controlCount + 2] != 4) {
                    allPost(pl, page);
                    return;
                }
                switch (data[controlCount + 2]) {
                    case 0:
                        allPost(pl, page);
                        break;
                    case 1:
                        postDetails(pl, postId, page, 0);
                        break;
                    case 2:
                        comment(pl, postId, page, 0);
                        break;
                    case 3:
                        report(pl, postId, 0, page, false);
                        break;
                    case 4:
                        newPost(pl,null,null,null,null,0,page);
                }
            }
        }
    });
}

//我的帖子 窗体
function myPost(pl, page) {
    const postFile = new JsonConfigFile(jsonPath);
    let posts = postFile.get("posts");
    let myPostForm = mc.newCustomForm();
    let xuid = pl.xuid;
    let postCount = 0;
    let myPostText = "";
    let allId = [];
    let postsPerPage = postFile.get("postConfig")["postsPerPage"];
    let postCountOnCtPage = postsPerPage;
    let controlCount = 0;
    let likeControlList = [];
    if (page == null) page = 1;
    let pages = [];
    let pageCount = 0;
    let idArr = [];
    for (let i=postFile.get("posts").length-1; i>=0; i--) {
        if (postFile.get("posts")[i]["visible"] && xuid == postFile.get("posts")[i]["playerXuid"]) {
            postCount++;
            allId.push(String(i));
        }
    }
    if (postCount == 0) {
        let noPostForm = mc.newSimpleForm();
        noPostForm.setTitle("我的帖子");
        noPostForm.setContent("没有找到你发的任何一个帖子...");
        noPostForm.addButton("新建一个帖子 >","textures/ui/mute_off");
        noPostForm.addButton("< 返回","textures/ui/undoArrow");
        pl.sendForm(noPostForm, (pl, id) => {
            if (id != null) {
                switch (id) {
                    case 0:
                        newPost(pl,null,null,"编辑你的第一个帖子",null,1,1);
                        break;
                    case 1:
                        main(pl);
                }
            }
        });
        return;
    }
    pageCount = Math.floor((postCount - 1) / postsPerPage) + 1;
    for (let i=1; i<=pageCount; i++) {
        pages.push(String(i));
    }
    if (page > pageCount) {
        myPost(pl,page-1);
        return;
    }
    if (pageCount == page) {
        postCountOnCtPage = (postCount - 1) % postsPerPage + 1;
    }
    myPostForm.setTitle(`我的帖子`);
    for (let i=0; i < postCountOnCtPage; i++) {
        let id = parseInt(allId[postsPerPage * (page - 1) + i]);
        let title = postFile.get("posts")[id]["title"];
        let text = postFile.get("posts")[id]["text"];
        let playerName = postFile.get("posts")[id]["playerName"];
        let system = postFile.get("posts")[id]["device"];
        let time = postFile.get("posts")[id]["time"];
        let like = postFile.get("posts")[id]["likedPlayer"].length;
        let postComment = postFile.get("posts")[id]["comment"];
        idArr.push("#" + String(id) + " §r(" + title + "§r)");
        myPostText = `${myPostText}${line}\n§l${title}§r\n${text}\n\n§7附带信息:\n[${system}] [#${id}]\n[${time}]\n[赞 ${like}]  [评论 ${postComment.length}]§r`
        myPostForm.addLabel(myPostText);
        let postId = parseInt(allId[postsPerPage * (page - 1) + i]);
        let likeStatus = false;
        if (posts[postId]["likedPlayer"].indexOf(pl.realName) != -1) likeStatus = true;
        myPostForm.addSwitch("点赞", likeStatus);    // id: 1 3 5 ...
        likeControlList.push(controlCount+1);
        controlCount = controlCount + 2;
        myPostText = "";
    }
    myPostForm.addStepSlider(`${line}\n\n< 第 ${page} 页，共 ${pageCount} 页 >\n跳转到页码`, pages, page - 1);    // controlCount
    myPostForm.addLabel("\n< 操作 >\n");    // controlCount + 1
    myPostForm.addStepSlider("选择操作", ["无","查看详情","评论","删除","新建帖子"]);    // controlCount + 2
    myPostForm.addStepSlider("选择帖子", idArr);    // controlCount + 3
    pl.sendForm(myPostForm, (pl, data) => {
        if (data != null) {
            const postFile = new JsonConfigFile(jsonPath);
            let posts = postFile.get("posts");
            for (let i=0; i < postCountOnCtPage; i++) {
                let postId = parseInt(allId[postsPerPage * (page - 1) + i]);
                let likeStatus = data[likeControlList[i]];    // 点赞按钮
                let playerName = pl.realName;
                let isLiking = false;    // 原来是否点赞
                if (posts[postId]["likedPlayer"].indexOf(playerName) != -1) isLiking = true;
                if (likeStatus == isLiking) {
                    continue;
                } else {
                    if (isLiking) {
                        // 原来点赞:除名
                        let indexOfPlayer = posts[postId]["likedPlayer"].indexOf(playerName);
                        posts[postId]["likedPlayer"] = [...posts[postId]["likedPlayer"].slice(0,indexOfPlayer), ...posts[postId]["likedPlayer"].slice(indexOfPlayer+1,posts[postId]["likedPlayer"].length)];
                    } else {
                        // 原来未点赞:加名
                        posts[postId]["likedPlayer"].push(playerName); 
                    }
                }
            }
            postFile.set("posts", posts);
            if (data[controlCount] + 1 != page) {
                myPost(pl, data[controlCount] + 1);
            } else {
                let postId = parseInt(allId[postsPerPage * (page - 1) + data[controlCount + 3]]);
                if (isNaN(postId) && data[controlCount + 2] != 4) {
                    myPost(pl, page);
                    return;
                }
                switch (data[controlCount + 2]) {
                    case 1:
                        postDetails(pl, postId, page, 1);
                        break;
                    case 2:
                        comment(pl, postId, page, 1);
                        break;
                    case 3:
                        deleteConfirm(pl, postId, 1, page);
                        break;
                    case 4:
                        newPost(pl,null,null,null,null,1,page);
                }
            }
        }
    });
}

//新建帖子 窗体
function newPost(pl,title,text,content,draftId,formId,page) {    // 3
    const postFile = new JsonConfigFile(jsonPath);
    let newPostForm = mc.newCustomForm();
    let option = ["发布","存草稿"];
    if (draftId != null) option = ["发布","存草稿","§c删除草稿"];
    if (title == null) title = "";
    if (text == null) text = "";
    if (content == null) content = "";
    newPostForm.setTitle("新建帖子");
    newPostForm.addInput("标题","请输入标题",title);
    newPostForm.addInput("正文","请输入正文",text);
    newPostForm.addLabel(content);
    newPostForm.addStepSlider("操作", option);
    pl.sendForm(newPostForm, (pl, data) => {
        if (data != null) {
            let title = data[0];
            let text = data[1];
            let operation = data[3];
            let limit1 = postFile.get("postConfig")["titleLimit"];
            let limit2 = postFile.get("postConfig")["textLimit"];
            if (operation == 1) {
                const postFile = new JsonConfigFile(jsonPath);
                if (title.length == 0 && text.length == 0) {
                    content = "保存失败：草稿无内容";
                    newPost(pl,title,text,content,draftId,formId,page);
                    return;
                }
                if (draftId != null) {
                    let draft = postFile.get("draft");
                    let thisDraft = {
                        "title": data[0],
                        "text": data[1],
                        "playerName": pl.realName,
                        "playerXuid": pl.xuid,
                        "visible": true
                    };
                    draft[draftId] = thisDraft;
                    postFile.set("draft", draft);
                } else {
                    let draft = postFile.get("draft");
                    let thisDraft = {
                        "title": data[0],
                        "text": data[1],
                        "playerName": pl.realName,
                        "playerXuid": pl.xuid,
                        "visible": true
                    };
                    draft[draft.length] = thisDraft;
                    postFile.set("draft", draft);
                }
                whatToDoNext(pl, formId, page);
            } else if (operation == 0) {
                if (title.length > limit1 || text.length > limit2) { 
                    let content = `发布失败：超出字符限制\n标题字数 ===> ${title.length}/${limit1}\n正文字数 ===> ${text.length}/${limit2}`;
                    newPost(pl,title,text,content,draftId,formId,page);
                    return;
                } else if (title.length == 0 || text.length == 0) {
                    let content = `发布失败：标题与正文不可留空`;
                    newPost(pl,title,text,content,draftId,formId,page);
                    return;
                }
                confirm(pl,title,text,draftId,formId,page);
            } else if (operation == 2) {
                title = data[0];
                text = data[1];
                draftDeleteConfirm(pl, draftId, title, text);
            } 
        } else {
            switch (formId) {
                case 0:
                    allPost(pl);
                    break;
                case 1:
                    myPost(pl);
                    break;
                case 2:
                    editDraft(pl);
                    break;
                case null:
                    main(pl);
            }
        }
    });
}

//编辑草稿 窗体
function editDraft(pl) { // formId == 2
    const postFile = new JsonConfigFile(jsonPath);
    let draftForm = mc.newSimpleForm();
    let noDraftForm = mc.newSimpleForm();
    let draftIdList = [];
    let buttonText = "";
    let title = "";
    let text = "";
    draftForm.setTitle("编辑草稿");
    draftForm.addButton("< 返回","textures/ui/undoArrow");
    for (let i=postFile.get("draft").length-1; i>=0; i--) {
        if (postFile.get("draft")[i]["playerXuid"] == pl.xuid && postFile.get("draft")[i]["visible"] == true) {
            draftIdList.push(String(i));
            if (postFile.get("draft")[i]["title"] != "") {
                buttonText = postFile.get("draft")[i]["title"];
            } else {
                buttonText = `[无标题草稿 #${i}]`
            }
            draftForm.addButton(buttonText);
        }
    }
    draftForm.setContent(`你有 ${draftIdList.length} 个草稿`);
    if (draftIdList.length == 0) {
        let noDraftForm = mc.newSimpleForm();
        noDraftForm.setTitle("编辑草稿");
        noDraftForm.setContent("没有发现你的任何一份草稿...");
        noDraftForm.addButton("新建一个帖子 >","textures/ui/mute_off");
        noDraftForm.addButton("< 返回","textures/ui/undoArrow");
        pl.sendForm(noDraftForm, (pl, id) => {
            if (id != null) {
                switch (id) {
                    case 0:
                        newPost(pl,null,null,null,null,2);
                        break;
                    case 1:
                        main(pl);
                }
            }
        });
        return;
    }
    pl.sendForm(draftForm, (pl, id) => {
        if (id != null) {
            switch (id) {
                case 0:
                    main(pl);
                    break;
                case id:
                    let i = parseInt(draftIdList[id-1]);
                    newPost(pl,postFile.get("draft")[i]["title"],postFile.get("draft")[i]["text"],null,i,2);
            }
        }
    });
}

//举报处理 窗体
function reportMng(pl) {
    const postFile = new JsonConfigFile(jsonPath);
    let reportedPost = postFile.get("report");
    let reportMngForm = mc.newSimpleForm();
    reportMngForm.setTitle("已被举报的帖子");
    reportMngForm.addButton("< 返回","textures/ui/undoArrow");
    if (reportedPost.length == 0) reportMngForm.setContent("空空如也");
    for (let i=reportedPost.length-1; i>=0; i--) {
        let title = postFile.get("posts")[reportedPost[i]["postId"]]["title"];
        let postId = postFile.get("posts")[reportedPost[i]["postId"]]["id"];
        let color = "§c";
        if (postFile.get("report")[i]["isProcessed"]) color = "§a";
        reportMngForm.addButton(`§7[${color}#${postId}§7]§r${title}`);
    }
    pl.sendForm(reportMngForm, (pl, id) => {
        if (id != null) {
            switch (id) {
                case 0:
                    main(pl);
                    break;
                case id:
                    reportDetail(pl, reportedPost.length-id);
            }
        }
    });
}

function reportDetail(pl, reportId) {
    const postFile = new JsonConfigFile(jsonPath);
    let postId = postFile.get("report")[reportId]["postId"];
    let reportDetailsForm = mc.newSimpleForm();
    let label = "";
    let title = postFile.get("posts")[postId]["title"];
    let text = postFile.get("posts")[postId]["text"];
    let playerName = postFile.get("posts")[postId]["playerName"];
    let system = postFile.get("posts")[postId]["device"];
    let time = postFile.get("posts")[postId]["time"];
    let like = postFile.get("posts")[postId]["likedPlayer"].length;
    let postComment = postFile.get("posts")[postId]["comment"];
    label = `§l${title}§r\n${text}\n\n§7附带信息:\n[${playerName}] [${system}] [#${postId}]\n[${time}]\n[赞 ${like}]  [评论 ${postComment.length}]§r`
    if (like != 0) {
        label = label + "\n\n§4❤§r " + postFile.get("posts")[postId]["likedPlayer"][0];
        for (let i=1; i<like; i++) {
            label = label + ", " + postFile.get("posts")[postId]["likedPlayer"][i];
        }
    }
    let whistleblowerCnt = postFile.get("report")[reportId]["whistleblower"].length;
    label = label + "\n\n\n>> 共有" + String(whistleblowerCnt) + "条举报 <<\n";
    for (let i=whistleblowerCnt-1; i>=0; i--) {
        let whistleblower = postFile.get("report")[reportId]["whistleblower"][i];
        let time = postFile.get("report")[reportId]["time"][i];
        let remark = postFile.get("report")[reportId]["remark"][i];
        label = `${label}\n举报者：${whistleblower}\n时间：${time}\n备注：${remark}\n`;
    }
    reportDetailsForm.setTitle(`[#${postId}] 举报处理`);
    reportDetailsForm.setContent(label);
    reportDetailsForm.addButton(`可见：${postFile.get("posts")[postId]["visible"]}`);
    reportDetailsForm.addButton(`已处理：${postFile.get("report")[reportId]["isProcessed"]}`);
    pl.sendForm(reportDetailsForm, (pl, id) => {
        if (id == null) {
            reportMng(pl);
        } else {
            const postFile = new JsonConfigFile(jsonPath);
            switch (id) {
                case 0:
                    let tempPost = postFile.get("posts");
                    tempPost[postId]["visible"] = !tempPost[postId]["visible"];
                    postFile.set("posts", tempPost);
                    reportDetail(pl, reportId);
                    break;
                case 1:
                    let tempReport = postFile.get("report");
                    tempReport[reportId]["isProcessed"] = !tempReport[reportId]["isProcessed"];
                    postFile.set("report", tempReport);
                    reportDetail(pl, reportId);
            }
        }
    });
}

//插件设置 窗体
function postSettings(pl) {
    const postFile = new JsonConfigFile(jsonPath);
    let postConfig = postFile.get("postConfig");
    let name = postFile.get("postConfig")["name"];
    let textLimit = postFile.get("postConfig")["textLimit"];
    let titleLimit = postFile.get("postConfig")["titleLimit"];
    let postsPerPage = postFile.get("postConfig")["postsPerPage"];
    let enableCaptcha = postFile.get("postConfig")["enableCaptcha"];
    let configArray = [name, titleLimit, textLimit, postsPerPage, enableCaptcha];
    let configArray2 = ["name", "titleLimit", "textLimit", "postsPerPage", "enableCaptcha"];
    let settingsForm = mc.newCustomForm();
    settingsForm.setTitle("设置");
    settingsForm.addInput("名称", name, name);
    settingsForm.addSlider("标题文本字数限制",1,100,1,titleLimit);
    settingsForm.addSlider("正文文本字数限制",1,100,1,textLimit);
    settingsForm.addSlider("每页显示帖子数量",1,100,1,postsPerPage);
    settingsForm.addSwitch("启用发帖的人机验证",enableCaptcha)
    pl.sendForm(settingsForm, (pl, data) => {
        if (data != null) {
            for (let i = 0; i<configArray.length; i++) {
                if (configArray[i] != data[i]) {
                    postConfig[configArray2[i]] = data[i];
                }
            }
            postFile.set("postConfig", postConfig);
            pl.tell("配置已保存");
        }
    });
}

//确认
function confirm(pl,title,text,draftId,formId,page) {
    const postFile = new JsonConfigFile(jsonPath);
    let confirmForm = mc.newSimpleForm();
    let content = "§l" + title + "§r\n\n" + text;
    confirmForm.setContent(content);
    confirmForm.addButton("确认发布","textures/ui/send_icon");
    confirmForm.addButton("< 返回编辑","textures/ui/undoArrow");
    pl.sendForm(confirmForm, (pl, id) => {
        if (id == 0) {
            //发布
            if (postFile.get("postConfig")["enableCaptcha"]) {
                captcha(pl,"通过人机验证后即可发帖",title,text,draftId,formId,page);
            } else {
                if (draftId != null) {
                    const postFile = new JsonConfigFile(jsonPath);
                    draft = postFile.get("draft");
                    draft[draftId]["visible"] = false;
                    postFile.set("draft", draft);
                }
                sendPost(pl, title, text, draftId);
            }
        } else if (id == 1 || id == null) {
            //返回编辑
            newPost(pl,title,text,null,draftId,formId);
        }
    });
}

//帖子详情 窗体
function postDetails(pl, postId, page, formId) {
    const postFile = new JsonConfigFile(jsonPath);
    let postDetailsForm = mc.newSimpleForm();
    let label = "";
    let id = postId;
    let title = postFile.get("posts")[id]["title"];
    let text = postFile.get("posts")[id]["text"];
    let playerName = postFile.get("posts")[id]["playerName"];
    let system = postFile.get("posts")[id]["device"];
    let time = postFile.get("posts")[id]["time"];
    let like = postFile.get("posts")[id]["likedPlayer"].length;
    let postComment = postFile.get("posts")[id]["comment"];
    label = `§l${title}§r\n${text}\n\n§7附带信息:\n[${playerName}] [${system}] [#${id}]\n[${time}]\n[赞 ${like}]  [评论 ${postComment.length}]§r`
    if (like != 0) {
        label = label + "\n\n§4❤§r " + postFile.get("posts")[id]["likedPlayer"][0];
        for (let i=1; i<like; i++) {
            label = label + ", " + postFile.get("posts")[id]["likedPlayer"][i];
        }
    }
    if (postComment.length != 0) {
        label = label + `\n${line}\n<§l评论区§r>\n`;
        for (let i=0; i<postComment.length; i++) {
            label = label + `\n§7[#${postComment[i].id}]§r\n[${postComment[i].playerName}]\n${postComment[i].text}\n`;
        }
    }
    postDetailsForm.setTitle("帖子详情");
    postDetailsForm.setContent(label);
    postDetailsForm.addButton("评论","textures/ui/comment");
    postDetailsForm.addButton("举报该帖子","textures/ui/hammer_l");
    if (pl.xuid == postFile.get("posts")[postId]["playerXuid"] || pl.isOP()) postDetailsForm.addButton("§c删除该帖子","textures/ui/redX1");
    pl.sendForm(postDetailsForm, (pl, id) => {
        if (id == null) {
            if (formId == 0) { 
                allPost(pl, page);
            } else if (formId == 1) {
                myPost(pl, page)
            }
        } else if (id == 0) {
            comment(pl, postId, page, formId, true);
        } else if (id == 1) {
            report(pl, postId, formId, page, true);
        } else if (id == 2) {
            deleteConfirm(pl, postId, formId, page, true);
        }
    });
}

//评论帖子 窗体
function comment(pl, postId, page, formId, isPostDetail, text) {
    const postFile = new JsonConfigFile(jsonPath);
    let commentForm = mc.newCustomForm();
    if (text == null) text = "输入一条友善的评论";
    if (isPostDetail == null) isPostDetail = false;
    commentForm.setTitle("评论帖子");
    commentForm.addInput(`评论 “${postFile.get("posts")[postId]["title"]}”`, text);
    pl.sendForm(commentForm, (pl, data) => {
        if (data == null) {    // 跳转到原先的窗口
            if (isPostDetail) {
                postDetails(pl, postId, page, formId);
            } else {
                switch (formId) {
                    case 0:
                        allPost(pl, page);
                        break;
                    case 1:
                        myPost(pl, page);
                }
            }
        } else {
            if (data[0] == "") {
                comment(pl, postId, page, formId, isPostDetail, "emm...你好像什么都没写啊")
            } else {
                const postFile = new JsonConfigFile(jsonPath);
                let posts = postFile.get("posts");
                let dv = pl.getDevice();
                var now = new Date();
                var year = now.getFullYear(); //得到年份
                var month = now.getMonth()+1;//得到月份
                var date = now.getDate();//得到日期
                var hour= now.getHours();//得到小时数
                var minute= now.getMinutes();//得到分钟数
                var second= now.getSeconds();//得到秒数
                let hour0 = String(hour);
                let minute0 = String(minute);
                let second0 = String(second);
                if (hour >= 0 && hour <= 9) hour0 = "0" + String(hour);
                if (minute >= 0 && minute <= 9) minute0 = "0" + String(minute);
                if (second >= 0 && second <= 9) second0 = "0" + String(second);
                let timeStr = `${year}.${month}.${date} ${hour0}:${minute0}:${second0}`; 
                posts[postId]["comment"][posts[postId]["comment"].length] = {
                    "id": posts[postId]["comment"].length,
                    "text": data[0],
                    "playerName": pl.realName,
                    "playerXuid": pl.xuid,
                    "device": dv.os,
                    "time": timeStr,
                    "likedPlayer": [],
                    "visible": true,
                    "report": false
                };
                postFile.set("posts", posts);
                pl.tell(`评论发布成功§7[#${posts[postId]["comment"].length}]`);
                postDetails(pl, postId, page, formId);
            }
        }
    });
}

//人机验证 窗体
function captcha(pl,label,title,text,draftId,formId,page) {
    if (label == null) label = "";
    let code = Math.floor(Math.random()*21);
    let captchaForm = mc.newCustomForm();
    captchaForm.setTitle("人机验证");
    captchaForm.addLabel(`${label}\n滑块滑动到相应数字来通过验证。\n验证码：${code}`);
    captchaForm.addStepSlider("验证码",["0","1","2","3",'4','5',"6",'7',"8",'9',`10`,`11`,'12','13',"14",`15`,'16',`17`,"18","19","20"]);
    pl.sendForm(captchaForm, (pl,data) => {
        if (data == null) {
            newPost(pl,title,text,null,draftId,formId,page);
            return false;
        } else if (data[1] != code) {
            label = "验证失败，请重试\n";
            captcha(pl,label,title,text,draftId,formId,page);
        } else {
            sendPost(pl, title, text, draftId);
            return true;
        }
    });
}

// 发送
function sendPost(pl,title,text,draftId) {
    const postFile = new JsonConfigFile(jsonPath);
    let posts = postFile.get("posts");
    let dv = pl.getDevice();
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth()+1;//得到月份
    var date = now.getDate();//得到日期
    // var day = now.getDay();//得到周几
    var hour= now.getHours();//得到小时数
    var minute= now.getMinutes();//得到分钟数
    var second= now.getSeconds();//得到秒数
    let hour0 = String(hour);
    let minute0 = String(minute);
    let second0 = String(second);
    if (hour >= 0 && hour <= 9) {
        hour0 = "0" + String(hour);
    }
    if (minute >= 0 && minute <= 9) {
        minute0 = "0" + String(minute);
    }
    if (second >= 0 && second <= 9) {
        second0 = "0" + String(second);
    }
    let timeStr = `${year}.${month}.${date} ${hour0}:${minute0}:${second0}`; 
    let thisPost = {
        "id": posts.length,
        "title": title,
        "text": text,
        "playerName": pl.realName,
        "playerXuid": pl.xuid,
        "device": dv.os,
        "time": timeStr,
        "likedPlayer": [],
        "visible": true,
        "report": false,
        "comment": []
    };
    posts[posts.length] = thisPost;
    postFile.set("posts", posts);
    pl.tell(`帖子已发布§7[#${posts.length-1}]`);
    allPost(pl);
    // 删除草稿
    if (draftId != null) {
        const postFile = new JsonConfigFile(jsonPath);
        let draft = postFile.get("draft");
        draft[draftId]["visible"] = false;
        postFile.set("draft", draft);
    }
}

function report(pl, postId, formId, page, isPostDetail) {
    let reportForm = mc.newCustomForm();
    const postFile = new JsonConfigFile(jsonPath);
    reportForm.setTitle("举报帖子");
    reportForm.addInput(`举报“${postFile.get("posts")[postId]["title"]}”\n\n举报理由（选填）`, "言论不当、发表广告、违法违规 etc.");
    pl.sendForm(reportForm, (pl, data) => {
        if (data != null) {
            const postFile = new JsonConfigFile(jsonPath);
            let reportedPost = postFile.get("report");
            let reportId = reportedPost.length;
            var now = new Date();
            var year = now.getFullYear(); //得到年份
            var month = now.getMonth()+1;//得到月份
            var date = now.getDate();//得到日期
            var hour= now.getHours();//得到小时数
            var minute= now.getMinutes();//得到分钟数
            var second= now.getSeconds();//得到秒数
            let hour0 = String(hour);
            let minute0 = String(minute);
            let second0 = String(second);
            if (hour >= 0 && hour <= 9) hour0 = "0" + String(hour);
            if (minute >= 0 && minute <= 9) minute0 = "0" + String(minute);
            if (second >= 0 && second <= 9) second0 = "0" + String(second);
            let timeStr = `${year}.${month}.${date} ${hour0}:${minute0}:${second0}`; 
            for (let i=0; i<reportedPost.length; i++) {
                if (postId == reportedPost[i]["postId"]) {
                    reportId = i;
                }
            }
            if (reportId < reportedPost.length) {
                reportedPost[reportId]["whistleblower"][reportedPost[reportId]["whistleblower"].length] = pl.realName;
                reportedPost[reportId]["time"][reportedPost[reportId]["time"].length] = timeStr;
                reportedPost[reportId]["remark"][reportedPost[reportId]["remark"].length] = data[0];
                reportedPost[reportId]["isProcessed"] = false;
            } else {
                let thisReport = {
                    "postId":postId,
                    "whistleblower":[pl.realName],
                    "time":[timeStr],
                    "remark":[data[0]],
                    "isProcessed": false
                };
                reportedPost[reportedPost.length] = thisReport;
            }
            postFile.set("report", reportedPost);
            pl.tell(`已将举报提交给管理员§7[#${postId}]`);
            if (isPostDetail) {
                postDetails(pl, postId, page, formId);
            } else {
                if (formId == 0) {
                    allPost(pl, page);
                } else if (formId == 1) {
                    myPost(pl, page);
                }
            }
        } else {
            if (isPostDetail) {
                postDetails(pl, postId, page, formId);
            } else {
                if (formId == 0) {
                    allPost(pl, page);
                } else if (formId == 1) {
                    myPost(pl, page);
                }
            }
        }
    });
}

function deleteConfirm(pl, postId, formId, page, isPostDetail) {
    if (isPostDetail == null) isPostDetail = false;
    const postFile = new JsonConfigFile(jsonPath);
    let deleteConfirmForm = mc.newSimpleForm();
    if (page == null) page = 1;
    let title = postFile.get("posts")[postId]["title"];
    let content = `您确定要删除 “${title}” 吗?这个帖子将会失去！（很长时间！）`;
    deleteConfirmForm.setTitle(`删除帖子?`);
    deleteConfirmForm.setContent(content);
    deleteConfirmForm.addButton("§c删除","textures/ui/redX1");
    deleteConfirmForm.addButton("取消","textures/ui/undoArrow");
    pl.sendForm(deleteConfirmForm, (pl, id) => {
        if (id == null) {
            if (isPostDetail) {
                postDetails(pl, postId, page, formId);
            } else {
                if (formId == 1) {
                    myPost(pl, page);
                } else if (formId == 0) {
                    allPost(pl, page);
                }
            }
        } else {
            const postFile = new JsonConfigFile(jsonPath);
            switch (id) {
                case 0:
                    let posts = postFile.get("posts");
                    posts[postId]["visible"] = false;
                    postFile.set("posts", posts);
                    pl.tell(`帖子已删除§7[#${postId}]`);
                    if (formId == 1) {
                        myPost(pl, 1);
                    } else if (formId == 0) {
                        allPost(pl, 1);
                    }
                    break;
                case 1:
                    if (isPostDetail) {
                        postDetails(pl, postId, page, formId);
                    } else {
                        if (formId == 1) {
                            myPost(pl, page);
                        } else if (formId == 0) {
                            allPost(pl, page);
                        }
                    }
            }
        }
    });
}

function draftDeleteConfirm(pl, draftId, title, text) {
    let emptyTitle = false;
    let emptyText = false;
    if (title == "") {
        title = "§7（无标题）§r";
        emptyTitle = true;
    }
    if (text == "") {
        text = "§7（无内容）§r";
        emptyText = true;
    }
    let draftDeleteConfirmForm = mc.newSimpleForm();
    draftDeleteConfirmForm.setTitle("删除草稿");
    draftDeleteConfirmForm.setContent(`确定丢弃这个草稿？\n\n标题：${title}\n正文：${text}`);
    draftDeleteConfirmForm.addButton("§c丢弃","textures/ui/redX1");
    draftDeleteConfirmForm.addButton("返回编辑","textures/ui/undoArrow");
    pl.sendForm(draftDeleteConfirmForm, (pl, id) => {
        if (id == null) {
            editDraft(pl);
        } else {
            switch (id) {
                case 0:
                    const postFile = new JsonConfigFile(jsonPath);
                    let draft = postFile.get("draft");
                    draft[draftId]["visible"] = false;
                    postFile.set("draft", draft);
                    pl.tell(`草稿已丢弃§7[#${draftId}]`);
                    editDraft(pl);
                    break;
                case 1:
                    if (emptyTitle) title = "";
                    if (emptyText) text = "";
                    newPost(pl, title, text, null, draftId, 2);
            }
        }
    });
}

function requireById(pl) {
    const postFile = new JsonConfigFile(jsonPath);
    let requireByIdForm = mc.newCustomForm();
    let label = `输入帖子ID`;
    if (postFile.get("posts").length > 0) label = `${label} [0,${postFile.get("posts").length - 1}]`; 
    requireByIdForm.setTitle("通过 ID 查询帖子");
    requireByIdForm.addInput(label);
    pl.sendForm(requireByIdForm, (pl, data) => {
        if (data != null) {
            let isNumber = true;
            for (let i=0; i<data[0].length; i++) {
                let t = data[0].slice(i,i+1);
                if (isNaN(Number(t))) {
                    isNumber = false;
                    break;
                }
            }
            if (data[0] == "") isNumber = false;
            if (isNumber == true) {
                if (Number(data[0]) >= postFile.get("posts").length) {
                    pl.tell("不存在这个帖子");
                    requireById(pl);
                    return;
                }
                let postId = Number(data[0]);
                postAllInfo(pl, postId);
            } else {
                pl.tell("数据输入错误");
                requireById(pl);
            }
        }
    })
}

function postAllInfo(pl, postId) {
    const postFile = new JsonConfigFile(jsonPath);
    let postAllInfoForm = mc.newSimpleForm();
    let thisPost = postFile.get("posts")[postId];
    let report = postFile.get("report");
    let txt = "";
    let likedPlayerLength = thisPost["likedPlayer"].length;
    let likedPlayerStr = "";
    let isReported = false;
    let reportId = -1;
    let reportStr = "";
    if (likedPlayerLength != 0) {
        likedPlayerStr = `点赞的玩家：${thisPost["likedPlayer"]}`
    }
    txt = `标题：${thisPost.title}\n正文：${thisPost.text}\n\n发布者：${thisPost.playerName}\nXUID：${thisPost.playerXuid}\n\n系统：${thisPost.device}\n时间：${thisPost.time}\n\n${likedPlayerStr}`
    for (let i=0; i<report.length; i++) {    // 遍历寻找举报记录
        if (report[i]["postId"] == postId) {
            isReported = true;
            reportId = i;
            reportStr = "举报信息：\n";
            break;
        }
    }
    if (isReported) {
        txt = `${txt}\n\n\n>> ${report[reportId]["whistleblower"].length}条举报 <<\n`
        for (let i=0; i<report[reportId]["whistleblower"].length; i++) {
            let whistleblower = report[reportId]["whistleblower"][i];
            let time = report[reportId]["time"][i];
            let remark = report[reportId]["remark"][i];
            txt = `${txt}\n举报者：${whistleblower}\n时间：${time}\n备注：${remark}\n`;
        }
    }
    postAllInfoForm.setTitle(`#${postId} 详细信息`);
    postAllInfoForm.setContent(txt);
    postAllInfoForm.addButton(`可见：${thisPost["visible"]}`);
    postAllInfoForm.addButton(`< 返回`,"textures/ui/undoArrow");
    
    pl.sendForm(postAllInfoForm, (pl, id) => {
        if (id != null) {
            const postFile = new JsonConfigFile(jsonPath);
            switch (id) {
                case 0:
                    let tempPost = postFile.get("posts");
                    tempPost[postId]["visible"] = !tempPost[postId]["visible"];
                    postFile.set("posts", tempPost);
                    postAllInfo(pl, postId);
                    break;
                case 1:
                    requireById(pl);
            }
        }
    });
}

function whatToDoNext(pl, formId, page) {
    let whatToDoNextForm = mc.newSimpleForm();
    whatToDoNextForm.setTitle("接下来的事");
    whatToDoNextForm.setContent("帖子已存储到草稿，接下来你想要...");
    whatToDoNextForm.addButton("退出","textures/ui/undoArrow");
    whatToDoNextForm.addButton("查看草稿");
    if (page != null) whatToDoNextForm.addButton("继续浏览");
    pl.sendForm(whatToDoNextForm, (pl, id) => {
        if (id != null) {
            switch (id) {
                case 1:
                    editDraft(pl);
                    break;
                case 2:
                    switch (formId) {
                        case 0:
                            allPost(pl, page);
                            break;
                        case 1:
                            myPost(pl, page);
                    }
                    break;
                case 0:
                    return;
                }
            }
        }
    );
}

// // 检验配置文件合法
// function isLegal(name) {
//     const postFile = new JsonConfigFile(jsonPath);
//     let postConfig = postFile.get("postConfig");
//     let changed = false;
//     let value = postFile.get("postConfig")[name];
//     if (name=="name") {
//         if (typeof(value)!=String) {
//             postConfig[name] = "Server";
//             changed == true;
//         }
//     }
//     else if (name=="textLimit") {
//         if (typeof(value)!=Number) {
//             postConfig[name] = 100;
//             changed == true;
//         } else if (value <= 0 || value > 100) {
//             postConfig[name] = 100;
//             changed == true;
//         }
//     }
//     else if (name=="titleLimit") {
//         if (typeof(value)!=Number) {
//             postConfig[name] = 50;
//             changed == true;
//         } else if (value <= 0 || value > 100) {
//             postConfig[name] = 50;
//             changed == true;
//         }
//     }
//     else if (name=="postsPerPage") {
//         if (typeof(value)!=Number) {
//             postConfig[name] = 15;
//             changed == true;
//         } else if (value <= 0 || value > 100) {
//             postConfig[name] = 15;
//             changed == true;
//         }
//     }
//     else if (name=="enableCaptcha") {
//         if (typeof(value)!=Boolean) {
//             postConfig[name] = true;
//             changed == true;
//         }
//     }
//     if (changed) postFile["postConfig"].set(name, postConfig);
// }