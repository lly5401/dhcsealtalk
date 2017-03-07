/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>
/// <reference path="../../../../typings/jquery/jquery.d.ts"/>

var addfirendCtr = angular.module("webim.addfirend", ["webim.main.server"]);

addfirendCtr.controller("searchfriendController", ["$scope", "$state", "mainServer",
    function ($scope: any, $state: angular.ui.IStateService, mainServer: mainServer) {

        $scope.friendlist = <webimmodel.UserInfo[]>[];

        $scope.searchfriend = function (content: any) {
            $scope.friendlist = <webimmodel.UserInfo[]>[];
            //ar reg = /^1[3-9][0-9]{9,9}$/;//不搜索用户手机号
            //if (reg.test(content)) {
            if (content) {
                $scope.getresultnull = false;
                mainServer.user.getUserByPhone(content).success(function (rep: any) {
                    if (rep.code == 200) {
                        var arr = rep.result;
                        console.log(arr);
                        for (let i = 0, len = arr.length; i < len; i++) {
                            var user = new webimmodel.UserInfo();
                            user.id = arr[i].id;
                            user.nickName = arr[i].nickname;
                            user.portraitUri = arr[i].portraitUri;
                            user.firstchar = webimutil.ChineseCharacter.getPortraitChar(arr[i].nickname);

                            user.phone = "";
                            user.region = "";
                            $scope.friendlist.push(user);
                        }

                    }
                }).error(function (err) {
                    console.log(err);
                    $scope.getresultnull = true;
                })
            }
        }

        $scope.back = function () {
            // $state.go("main");
            window.history.back();
        }

    }])

addfirendCtr.controller("applyfriendController", ["$scope", "$state", "$stateParams", "mainServer", "mainDataServer",
    function ($scope: any, $state: angular.ui.IStateService, $stateParams: angular.ui.IStateParamsService, mainServer: mainServer, mainDataServer: mainDataServer) {

        var userId = $stateParams["userId"];
        var userName = $stateParams["userName"];
        var groupid = $stateParams["groupid"];
        var targetid = $stateParams["targetid"];
        var conversationtype = $stateParams["conversationtype"];
        var addfriendinfo = "我是" + mainDataServer.loginUser.nickName;

        $scope.title = userName;
        // $scope.message = '我是' + userName;
        $scope.applyfriendbtn = function () {
            var id = userId;
            if (!$scope.message) {
                webimutil.Helper.alertMessage.error("消息不可为空！", 2);
                return;
            }
            if (!id) {
                webimutil.Helper.alertMessage.error("添加用户为空！", 2);
                return;
            }

            mainServer.friend.invite(id, $scope.message).success(function (rep) {
                // $state.go("main");
                $state.go("main.friendinfo", { userid: userId, groupid: groupid, targetid: targetid, conversationtype: conversationtype });

                var action = rep.result.action;
                if (action == "Added") {
                    var addfriend = new webimmodel.Friend({
                        id: id,
                        name: userName,
                        imgSrc: ""
                    });
                    mainServer.user.getInfo(id).success(function (rep) {
                        addfriend.imgSrc = rep.result.portraitUri;
                    });
                    mainDataServer.contactsList.addFriend(addfriend);
                    webimutil.Helper.alertMessage.success("已成为好友！", 2);
                } else if (action == "Sent") {
                    webimutil.Helper.alertMessage.success("发送成功！", 2);
                } else {
                    console.log(rep);
                }

            }).error(function (err, code) {
                if (code == 400) {
                    webimutil.Helper.alertMessage.error("已经是好友！", 2);
                } else {
                    console.log(err)
                }
            })
        };
        $scope.back = function () {
            if (conversationtype) {
                $state.go("main.friendinfo", { userid: userId, groupid: groupid, targetid: targetid, conversationtype: conversationtype });
            } else {
                $state.go("main.searchfriend");
            }
        }
        if (groupid != '0' && groupid != '') {
            var groupname = mainDataServer.contactsList.getGroupById(groupid) ? mainDataServer.contactsList.getGroupById(groupid).name : groupid;
            addfriendinfo = "我是“" + groupname + "群”的" + mainDataServer.loginUser.nickName;
        }
        $scope.getInfo = function () {
            return addfriendinfo;
        }
    }]);

addfirendCtr.directive("addfirenditem", ["$state", "mainDataServer",
    function ($state: angular.ui.IStateService, mainDataServer: mainDataServer) {
        return {
            restrict: "E",
            scope: { item: "=" },
            template: '<li class="chat_item joinGroup_item addFriends_item">' +
            '<div class="photo">' +
            '<img class="img" ng-show="item.portraitUri" ng-src="{{item.portraitUri||\'assets/img/barBg.png\'}}" alt="">' +
            '<div class="portrait" ng-show="!item.portraitUri">{{item.firstchar}}</div>' +
            '</div>' +
            '<div class="info">' +
            '<h3 class="nickname">' +
            '<span class="nickname_text">{{item.nickName}}</span>' +
            '</h3>' +
            '<button class="functionBoxBtn" ng-click="applyfriendsrc()" ng-show="!isself">加好友</button>' +
            '</div>' +
            '</li>',
            link: function (scope: any, ele: angular.IRootElementService, attr: any) {
                angular.element(ele[0].getElementsByClassName("portrait")[0]).css("background-color", webimutil.Helper.portraitColors[scope.item.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
                scope.applyfriendsrc = function () {
                    var friend = mainDataServer.contactsList.getFriendById(scope.item.id);
                    if (friend) {
                        webimutil.Helper.alertMessage.error("此人已经是您的好友！", 2);
                        return;
                    }
                    $state.go("main.applyfriend", { userId: scope.item.id, userName: scope.item.nickName });
                }
                scope.isself = mainDataServer.loginUser.id == scope.item.id;
                if (scope.isself) {
                    angular.element(ele[0].getElementsByClassName("info")[0]).css("border", "none");
                }
            }
        }
    }])
