/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var friendinfo = angular.module("webim.editfriendinfo", ["webim.main.server"]);

friendinfo.controller("editfriendinfoController", ["$scope", "$state", "$stateParams", "$window", "mainDataServer", "mainServer", "RongIMSDKServer",
    function($scope: any, $state: angular.ui.IStateService, $stateParams: any, $window: angular.IWindowService,
        mainDataServer: mainDataServer, mainServer: mainServer, RongIMSDKServer: RongIMSDKServer) {

        $scope.$on("$viewContentLoaded", function() {
            setPortrait();
        });
        function setPortrait() {
            if ($scope.user.id) {
                angular.element(document.getElementById("portrait")).css("background-color", webimutil.Helper.portraitColors[$scope.user.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
            }
        }

        var userid = $stateParams["userid"];
        var groupid = $stateParams["groupid"];
        var targetid = $stateParams["targetid"];
        var conversationtype = $stateParams["conversationtype"];

        var friend = mainDataServer.contactsList.getFriendById(userid);

        var member = friend ? null : mainDataServer.contactsList.getGroupMember(conversationtype ? targetid : groupid, userid);

        var isself = mainDataServer.loginUser.id == userid;



        $scope.user = new webimmodel.UserInfo();



        // if (friend) {
        //     $scope.isself = isself;
        //     $scope.user.id = friend.id;
        //     $scope.user.nickName = friend.name;
        //     $scope.user.portraitUri = friend.imgSrc;
        //     $scope.user.firstchar = friend.firstchar;
        // } else {
        //     webimutil.Helper.alertMessage.error("无此好友", 2);
        //     $state.go("main.friendinfo", { userid: userid, targetid: targetid });
        // }
        $scope.isself = isself;
        $scope.isfriend = friend ? true : false;

        if (friend) {
            $scope.user.id = friend.id;
            $scope.user.nickName = friend.name;
            $scope.user.portraitUri = friend.imgSrc;
            $scope.user.firstchar = friend.firstchar;
            $scope.user.displayName = friend.displayName;
        } else if (member) {
            $scope.user.id = member.id;
            $scope.user.nickName = member.name;
            $scope.user.portraitUri = member.imgSrc;
            $scope.user.firstchar = member.firstchar;
            // $scope.user.displayName = member.displayName;
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

                $scope.user.displayName = rep.data.result.displayName;
                setPortrait();
            })

            // webimutil.Helper.alertMessage.error("陌生人不做显示", 2);
            // goback();
        }
        var addBlackList = function(id: any) {
            mainServer.user.addToBlackList(id).success(function() {
                mainDataServer.blackList.add(new webimmodel.Friend({
                    id: $scope.user.id,
                    name: $scope.user.nickName,
                    imgSrc: $scope.user.portraitUri
                }))
            })
        }
        var removeBlackList = function(id: any) {
            mainServer.user.removeFromBlackList(id).success(function() {
                mainDataServer.blackList.remove(id);
            });
        }

        $scope.user.inBlackList = mainDataServer.blackList.getById(userid) ? true : false;

        var loading = false;

        $scope.removeFriend = function() {
            //删除好友
            //请求服务器删除
            if (loading)
                return;
            loading = true;
            mainServer.friend.setDisplayName($scope.user.id, "").success(function() {
            }).error(function() {
                console.log("删除好友昵称失败");
            })
            mainServer.friend.delete($scope.user.id).success(function() {
                RongIMSDKServer.removeConversation(webimmodel.conversationType.Private, $scope.user.id).then(function() {
                    loading = false;
                    var bo = mainDataServer.contactsList.removeFriend($scope.user.id);
                    bo ? "" : console.log("删除好友失败");
                    $state.go("main");
                }, function() {
                    console.log("删除失败");
                });

            }).error(function() {
                loading = false;
                webimutil.Helper.alertMessage.error("删除失败", 2);
            })

        }

        $scope.switchchange = function() {
            if ($scope.user.inBlackList) {
                addBlackList($scope.user.id);
            } else {
                removeBlackList($scope.user.id);
            }
        }


        $scope.back = function() {
          window.history.back();
            // $state.go("main.friendinfo", { userid: userid, groupid: groupid, targetid: targetid, conversationtype: conversationtype })
        }

        $scope.save = function() {
            if ($scope.modifyName.$valid) {
                mainServer.friend.setDisplayName($scope.user.id, $scope.user.displayName).success(function() {
                  var friend = mainDataServer.contactsList.getFriendById($scope.user.id);
                  var friendOld = webimutil.Helper.cloneObject(friend);
                  var curCon = mainDataServer.conversation.getConversation(1, $scope.user.id);
                  if(curCon){
                     curCon.title = $scope.user.displayName;
                  }
                  if(friend){
                     friend.displayName = $scope.user.displayName;
                     mainDataServer.contactsList.updateOrAddFriend(friend);
                     var fold = webimutil.ChineseCharacter.getPortraitChar2(friendOld.displayName || friendOld.name);
                     var fnew = webimutil.ChineseCharacter.getPortraitChar2(friend.displayName || friend.name);
                     if(fold != fnew){
                       mainDataServer.contactsList.removeFriendFromSubgroup(friendOld);
                     }
                  }
                  $scope.back();
                })
                $scope.editable = false;
            }

        }

    }]);
