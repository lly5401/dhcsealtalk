/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var discussionAddMember = angular.module("webim.discussionaddmember", []);

discussionAddMember.controller("discussionaddmemberController", ["$scope", "$state", "$stateParams", "mainDataServer", "mainServer", "RongIMSDKServer",
    function($scope: any, $state: angular.ui.IStateService, $stateParams: any, mainDataServer: mainDataServer, mainServer: mainServer, RongIMSDKServer: RongIMSDKServer) {
        $scope.save = function() {
            throw new Error("Not implemented yet");
        }

        $scope.idorname = $stateParams["idorname"];

        $scope.isLoading = false;

        if ($stateParams["iscreate"] == "true") {
            //创建群组

            var friendList = [].concat.apply([], mainDataServer.contactsList.subgroupList.map(function(item) { return item.list }));
            //排除自己，自己可以和自己是好友
            friendList = friendList.filter(function(item: webimmodel.Friend, index: number, arr: webimmodel.Friend[]) {
                return item.id != mainDataServer.loginUser.id;
            })
            $scope.friendList = webimutil.Helper.cloneObject(friendList);

            $scope.searchfriend = function(str: string) {
                if (str == "") {
                    $scope.friendList = webimutil.Helper.cloneObject(friendList);
                } else {
                    var list = mainDataServer.contactsList.find(str, friendList);
                    $scope.friendList = webimutil.Helper.cloneObject(list);
                }
            }
            $scope.save = function() {
                if ($scope.isLoading) {
                    return;
                }
                var membersid = <string[]>[];
                var membersname = <string[]>[];
                var members = <webimmodel.Friend[]>[];
                var tempname = '';
                $scope.friendList.forEach(function(item: any) {
                    if (item.isSelected) {
                        membersid.push(item.id + "");
                        members.push(item);
                        membersname.push(item.name + "");
                    }
                });

                if (membersid.length < 1) {
                    webimutil.Helper.alertMessage.error("至少要有1个组成员", 2);
                    return;
                }

                tempname = membersname.join(',');
                if(tempname && tempname.length >  40){
                    tempname = tempname.substring(0, 40);
                }

                $scope.isLoading = true;

                //请求服务创建群组 将自己加入
                membersid.push(mainDataServer.loginUser.id);
                RongIMSDKServer.createDiscussion(tempname, membersid).then(function(rep) {
                    var discussion = new webimmodel.Discussion({
                        id: rep.data,
                        name: tempname,
                        imgSrc: "",
                        upperlimit: 500,
                        fact: 1,
                        creater: mainDataServer.loginUser.id,
                        isOpen: true
                    });
                    mainDataServer.contactsList.addDiscussion(discussion);
                    //1.添加群成员2.添加自己
                    mainDataServer.contactsList.addDiscussionMember(discussion.id, new webimmodel.Member({
                        id: mainDataServer.loginUser.id,
                        name: mainDataServer.loginUser.nickName,
                        imgSrc: mainDataServer.loginUser.portraitUri,
                        role: "0"
                    }));
                    for (var j = 0, len = members.length; j < len; j++) {
                        var member = new webimmodel.Member({
                            id: members[j].id,
                            name: members[j].name,
                            imgSrc: members[j].imgSrc,
                            role: "1"
                        });
                        mainDataServer.contactsList.addDiscussionMember(discussion.id, member);
                    }

                    members = undefined;
                    membersid = undefined;
                    webimutil.Helper.alertMessage.success("创建成功！", 2);
                    $state.go("main.chat", { targetId: discussion.id, targetType: webimmodel.conversationType.Discussion });

                    $scope.isLoading = false;
                },function() {
                    $scope.isLoading = false;
                    webimutil.Helper.alertMessage.error("失败", 2);
                });

                console.log($scope.friendList.filter(function(item: any) { return item.isSelected }));

            }
            $scope.back = function() {
                $state.go("main.creatediscussion")
            }
        } else {
            //修改群组

            var friendList = [].concat.apply([], mainDataServer.contactsList.subgroupList.map(function(item) { return item.list }));
            var memberList = mainDataServer.contactsList.getDiscussionById($scope.idorname).memberList;

            //排除已经在群里的用户
            var membersObj = <any>{};
            for (var i = 0, len = memberList.length; i < len; i++) {
                membersObj[memberList[i].id] = true;
            }
            friendList = friendList.filter(function(item: webimmodel.Friend, index: number, arr: webimmodel.Friend[]) {
                return !membersObj[item.id];
            })

            $scope.friendList = webimutil.Helper.cloneObject(friendList);

            $scope.searchfriend = function(str: string) {
                if (str == "") {
                    $scope.friendList = webimutil.Helper.cloneObject(friendList);
                } else {
                    var searchList = mainDataServer.contactsList.find(str, friendList);
                    $scope.friendList = webimutil.Helper.cloneObject(searchList);
                }
            }
            $scope.save = function() {
                //向每个用户发送 邀请加入群的通知
                if ($scope.isLoading) {
                    return;
                }
                $scope.isLoading = true;
                var membersid = <string[]>[];
                var members = <webimmodel.Friend[]>[];
                $scope.friendList.forEach(function(item: any) {
                    if (item.isSelected) {
                        membersid.push(item.id + "");
                        members.push(item);
                    }
                });
                if (membersid.length < 1) {
                    webimutil.Helper.alertMessage.error("至少要选择1个成员", 2);
                    return;
                }

                RongIMSDKServer.addMemberToDiscussion($scope.idorname, membersid, {
                  onSuccess: function () {
                    for (var j = 0, len = members.length; j < len; j++) {
                        var member = new webimmodel.Member({
                            id: members[j].id,
                            name: members[j].name,
                            imgSrc: members[j].imgSrc,
                            role: "1"
                        });
                        mainDataServer.contactsList.addDiscussionMember($scope.idorname, member);
                    }
                    members = undefined;
                    membersid = undefined;
                    $state.go("main.discussioninfo", { discussionid: $scope.idorname });
                    webimutil.Helper.alertMessage.success("添加成功！", 2);
                  },
                  onError: function () {
                    $scope.isLoading = false;
                    webimutil.Helper.alertMessage.error("失败", 2);
                  }
                });

            }

            $scope.back = function() {
                $state.go("main.discussioninfo", { discussionid: $stateParams["idorname"] });
            }
        }
    }]);

// discussionAddMember.directive("searchitem", function() {
//     return {
//         restrict: "E",
//         scope: { item: "=" },
//         template: '<li class="chat_item joinGroup_item addFriends_item">' +
//         '<div class="select">' +
//         '<input type="checkbox" class="hide" id="{{item.id}}" ng-model="item.isSelected" value="136" data-count="" name="">' +
//         '<label for="{{item.id}}"></label>' +
//         '</div>' +
//         '<div class="photo">' +
//         // '<img class="img" ng-src="{{item.imgSrc||\'assets/img/barBg.png\'}}" alt="">' +
//         '<div class="portrait">{{item.firstchar}}</div>' +
//         '</div>' +
//         '<div class="info">' +
//         '<h3 class="nickname">' +
//         '<span class="nickname_text">{{item.name}}</span>' +
//         '</h3>' +
//         '</div>' +
//         '</li>',
//         link: function(scope: any, ele: any, attr: any) {
//             angular.element(ele[0].getElementsByClassName("portrait")[0]).css("background-color", webimutil.Helper.portraitColors[scope.item.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
//         }
//     }
// })
