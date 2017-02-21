/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var friendinfo = angular.module("webim.friendinfo", ["webim.main.server"]);

friendinfo.controller("friendinfoController", ["$scope", "$rootScope", "$state", "$stateParams", "$window", "mainDataServer", "mainServer",
    function($scope: any, $rootScope: any, $state: angular.ui.IStateService, $stateParams: any, $window: angular.IWindowService, mainDataServer: mainDataServer, mainServer: mainServer) {

        $scope.$on("$viewContentLoaded", function() {
            setPortrait();
        });
        function setPortrait() {
            if (userid) {
                angular.element(document.getElementById("portrait")).css("background-color", webimutil.Helper.portraitColors[userid.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
            }
        }

        var userid = $stateParams["userid"];
        var groupid = $stateParams["groupid"];
        var targetid = $stateParams["targetid"];
        var conversationtype = $stateParams["conversationtype"];

        var friend = mainDataServer.contactsList.getFriendById(userid);

        var member = friend ? null : mainDataServer.contactsList.getGroupMember(conversationtype ? targetid : groupid, userid);

        var isself = friend ? null : mainDataServer.loginUser.id == userid;

        $scope.isfriend = !!friend;
        $scope.isself = !!isself;
        $scope.user = new webimmodel.UserInfo();

        if (friend) {
            // $scope.user.id = friend.id;
            // $scope.user.nickName = friend.name;
            // $scope.user.portraitUri = friend.imgSrc;
            // $scope.user.firstchar = friend.firstchar;
            //更新好友信息
            // mainDataServer.contactsList.removeFriend(userid);
            mainServer.friend.getProfile(userid).success(function(data) {
                var f = new webimmodel.Friend({ id: data.result.user.id, name: data.result.user.nickname, imgSrc: data.result.user.portraitUri });
                f.displayName = data.result.displayName;
                f.mobile = data.result.user.phone;
                // f = mainDataServer.contactsList.addFriend(f);
                f = mainDataServer.contactsList.updateOrAddFriend(f);
                mainDataServer.conversation.updateConversationDetail(webimmodel.conversationType.Private, userid, data.result.displayName || data.result.user.nickname, data.result.user.portraitUri);
                $scope.user.id = f.id;
                $scope.user.nickName = f.name;
                $scope.user.portraitUri = f.imgSrc;
                $scope.user.firstchar = f.firstchar;
                $scope.user.displayName = f.displayName;
                $scope.user.mobile = f.mobile;
            })

        } else if (member) {
            $scope.user.id = member.id;
            $scope.user.nickName = member.name;
            $scope.user.portraitUri = member.imgSrc;
            $scope.user.firstchar = member.firstchar;
        } else if (isself) {
            $scope.user.id = mainDataServer.loginUser.id;
            $scope.user.nickName = mainDataServer.loginUser.nickName;
            $scope.user.portraitUri = mainDataServer.loginUser.portraitUri;
            $scope.user.firstchar = mainDataServer.loginUser.firstchar;
        } else {
            mainServer.user.getInfo(userid).then(function(rep) {
                $scope.user.id = rep.data.result.id
                $scope.user.nickName = rep.data.result.nickname
                $scope.user.portraitUri = rep.data.result.portraitUri;

                $scope.user.firstchar = webimutil.ChineseCharacter.getPortraitChar(rep.data.result.nickname);
                setPortrait();
            })
        }


        $scope.edit = function() {
            $state.go("main.editfriendinfo", { userid: userid, groupid: groupid, targetid: targetid, conversationtype: conversationtype });
        }

        $scope.toAddFriend = function() {
            $state.go("main.applyfriend", { userId: $scope.user.id, userName: $scope.user.nickName, groupid: groupid, targetid: targetid, conversationtype: conversationtype })
        }

        $scope.toConversation = function() {
            $state.go("main.chat", { targetId: $scope.user.id, targetType: webimmodel.conversationType.Private }, { location: "replace" });
        };

        function goback() {
            if (groupid && groupid != "0") {
                $state.go("main.groupinfo", { groupid: groupid, conversationtype: conversationtype });
            } else {
                if (conversationtype && conversationtype != 0) {
                    $state.go("main.chat", { targetId: targetid, targetType: conversationtype });
                } else {
                    $state.go("main");
                }
            }
        }

        $scope.back = function() {
            // goback();
            // $rootScope.back();
            window.history.back();
        }

    }]);
