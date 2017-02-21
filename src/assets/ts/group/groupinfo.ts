/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var groupInfo = angular.module("webim.goupinfo", []);

groupInfo.controller("groupinfoController", ["$scope", "$rootScope", "$state", "$stateParams", "mainDataServer", "mainServer", "RongIMSDKServer",
    function($scope: any,$rootScope: any, $state: angular.ui.IStateService, $stateParams: angular.ui.IStateParamsService, mainDataServer: mainDataServer, mainServer: mainServer, RongIMSDKServer: RongIMSDKServer) {

        $scope.$on("$viewContentLoaded", function() {
            angular.element(document.getElementById("portrait")).css("background-color", webimutil.Helper.portraitColors[$scope.groupInfo.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
        });

        $scope.isEditable = false;

        function back() {
            if (conversationtype && conversationtype != "0") {
                $state.go("main.chat", { targetId: groupid, targetType: conversationtype });
            } else {
                $state.go("main");
            }
        }
        $scope.back = function() {
            back();
            // $rootScope.back();
        }

        var groupid = $stateParams["groupid"];
        var conversationtype = $stateParams["conversationtype"];

        $scope.groupInfo = mainDataServer.contactsList.getGroupById(groupid);

        if (!$scope.groupInfo) {
            webimutil.Helper.alertMessage.error("您不在此群组中", 2);
            back();
        }

        if ($scope.groupInfo.creater == mainDataServer.loginUser.id) {
            $scope.groupInfo.isCreater = true;
        }

        $scope.quitGroup = function() {
            mainServer.group.quit(groupid).success(function(rep) {
                if (rep.code == 200) {
                    mainDataServer.contactsList.removeGroup(groupid);

                    RongIMSDKServer.removeConversation(webimmodel.conversationType.Group, groupid).then(function() {
                        setTimeout(function () {
                            $scope.$emit("conversationChange");
                        }, 200);
                        $state.go("main");
                        webimutil.Helper.alertMessage.success("退出成功", 2);
                    }, function() {
                        setTimeout(function () {
                            $scope.$emit("conversationChange");
                        }, 200);
                        $state.go("main");
                        webimutil.Helper.alertMessage.success("退出成功删除会话失败", 2);
                    });
                }
            }).error(function() {
                webimutil.Helper.alertMessage.error("退出失败", 2);
            });
        }
        $scope.kickMember = function() {
            var membersid = <string[]>[];
            $scope.groupInfo.memberList.filter(function(item: any) {
                if (item.isSelected) {
                    return membersid.push(item.id);
                }
            });
            mainServer.group.kickMember(groupid, membersid).success(function(rep) {
                if (rep.code == 200) {
                    for (var i = 0, len = membersid.length; i < len; i++) {
                        mainDataServer.contactsList.removeGroupMember(groupid, membersid[i]);
                    }
                    $scope.isEditable = false;
                }
            }).error(function(err) {
                console.log(err);
                webimutil.Helper.alertMessage.error("删除失败", 2);
            })
        }
        $scope.toChat = function() {
            $state.go("main.chat", { targetId: $scope.groupInfo.id, targetType: webimmodel.conversationType.Group }, { location: "replace" });
        }
        $scope.toBulletin = function() {
            $state.go("main.groupbulletin", { groupid: groupid });
        }
        $scope.addmember = function() {
            $state.go("main.groupaddmember", { iscreate: "false", idorname: $scope.groupInfo.id })
        }

        $scope.dismiss = function() {
            //解散群组
            mainServer.group.dismissGroup(groupid).success(function(rep) {
                if (rep.code == 200) {
                    mainDataServer.contactsList.removeGroup(groupid);
                    RongIMSDKServer.removeConversation(webimmodel.conversationType.Group, groupid).then(function() {
                        setTimeout(function () {
                            $scope.$emit("conversationChange");
                        }, 200);
                        $state.go("main");
                        webimutil.Helper.alertMessage.success("解散成功", 2);
                    }, function() {
                        setTimeout(function () {
                            $scope.$emit("conversationChange");
                        }, 200);
                        $state.go("main");
                        webimutil.Helper.alertMessage.success("解散成功删除会话失败", 2);
                    });
                }
            }).error(function() {

            })
        }

    }]);

groupInfo.controller("groupbulletinController", ["$scope", "$state", "$stateParams", "mainServer", "mainDataServer", "RongIMSDKServer", "conversationServer",
    function($scope: any, $state: angular.ui.IStateService, $stateParams: angular.ui.IStateParamsService, mainServer: mainServer, mainDataServer: mainDataServer, RongIMSDKServer: RongIMSDKServer, conversationServer: conversationServer) {

        var groupid = $stateParams["groupid"], targettype = RongIMLib.ConversationType.GROUP;
        // var picBackground = document.getElementsByClassName("previewPicLayer")[0];
        var picBackground = $('div.previewPicLayer');
        $scope.isActive = false;
        $scope.showDialog1 = false;
        $scope.showDialog2 = false;

        $scope.groupbulletinbtn = function() {
          $scope.showDialog1 = true;
          picBackground.css('visibility','visible');
          if (!$scope.message) {
              webimutil.Helper.alertMessage.error("消息不可为空！", 2);
              return;
          }
          if (!groupid) {
              webimutil.Helper.alertMessage.error("群信息不可为空！", 2);
              return;
          }
        };
        $scope.back = function() {
            $state.go("main.groupinfo", { groupid: groupid, conversationtype: targettype });
        }
        $scope.cancelbtn = function() {
            $scope.showDialog1 = false;
            $scope.showDialog2 = true;
            // picBackground.css('visibility','hidden');
        }
        $scope.cancelbtn2 = function() {
            $scope.showDialog1 = false;
            $scope.showDialog2 = false;
            picBackground.css('visibility','hidden');
        }
        $scope.quitbtn = function() {
            $scope.showDialog1 = false;
            $scope.showDialog2 = false;
            picBackground.css('visibility','hidden');
            $state.go("main.groupinfo", { groupid: groupid, conversationtype: targettype });
        }
        $scope.publicbtn = function() {
            $scope.showDialog1 = false;
            picBackground.css('visibility','hidden');
            var msg = RongIMLib.TextMessage.obtain('@所有人\n' + $scope.message);
            var mentioneds = new RongIMLib.MentionedInfo();
            mentioneds.type = webimmodel.AtTarget.All;
            mentioneds.userIdList = [""];
            msg.mentionedInfo = mentioneds;

            RongIMSDKServer.sendMessage(targettype, groupid, msg, true).then(function (data) {
               webimutil.Helper.alertMessage.success("发布成功", 2);
               $state.go("main.groupinfo", { groupid: groupid, conversationtype: targettype });
            }, function (error) {
                var content = '';
                switch (error.errorCode) {
                    case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                        content = "您的消息已经发出，但被对方拒收";
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_GROUP:
                        content = "你不在该群组中";
                        break;
                    default:
                }
                if (content) {
                    var msg = webimutil.Helper.cloneObject(error.message);
                    msg.content = content;
                    msg.panelType = webimmodel.PanelType.InformationNotification;
                }
            });
            var msgouter = packmysend(msg, webimmodel.MessageType.TextMessage);
            conversationServer.addHistoryMessages(groupid, targettype, webimmodel.Message.convertMsg(msgouter));
            $scope.mainData.conversation.updateConStatic(webimmodel.Message.convertMsg(msgouter), true, true);
        }
        $scope.$watch('message', function(newValue: string, oldValue: string){
            if(newValue === oldValue){
                return;
            }
            if(newValue.length > 0){
              $scope.isActive = true;
            }else{
              $scope.isActive = false;
            }
        });
        function packmysend(msg: any, msgType: string) {
            var msgouter = new RongIMLib.Message();
            msgouter.content = msg;
            msgouter.conversationType = targettype;
            msgouter.targetId = groupid;
            msgouter.sentTime = (new Date()).getTime() - RongIMLib.RongIMClient.getInstance().getDeltaTime();
            msgouter.messageDirection = RongIMLib.MessageDirection.SEND;
            msgouter.messageType = msgType;
            msgouter.senderUserId = mainDataServer.loginUser.id;
            return msgouter;
        }
    }]);

groupInfo.directive("member", ["$state", "mainDataServer", function($state: angular.ui.IStateService, mainDataServer: mainDataServer) {
    return {
        restrict: "E",
        scope: { item: "=", isshow: "=" },
        template: '<li class="chat_item groupUser_item">' +
        '<div class="select"  ng-show="isshow">' +
        '<input type="checkbox" class="hide" ng-disabled="item.id==loginUserid" id="{{item.id}}" value="136" ng-model="item.isSelected" data-count="" name="">' +
        '<label for="{{item.id}}"></label>' +
        '</div>' +
        '<div ng-click="showinfo()">' +
        '<div class="photo">' +
        '<img class="img" ng-show="item.imgSrc" ng-src="{{item.imgSrc||\'assets/img/barBg.png\'}}" alt="">' +
        '<div class="portrait" ng-show="!item.imgSrc">{{item.firstchar}}</div>' +
        '</div>' +
        '<div class="info">' +
        '<h3 class="nickname">' +
        '<span class="nickname_text">{{showName}}</span>' +
        '</h3>' +
        '</div>' +
        '</div>' +
        '</li>',
        link: function(scope: any, ele: any, attr: any) {
            angular.element(ele[0].getElementsByClassName("portrait")[0]).css("background-color", webimutil.Helper.portraitColors[scope.item.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);
            //查找是否在好友列表中
            var user = mainDataServer.contactsList.getFriendById(scope.item.id);
            if(user){
              scope.showName = user.displayName || user.name;
            }
            scope.showName = scope.item.displayName || scope.showName || scope.item.name;
            scope.showinfo = function() {
                $state.go("main.friendinfo", { userid: scope.item.id, groupid: scope.$parent.groupInfo.id, targetid: scope.$parent.groupInfo.id, conversationtype: $state.params["conversationtype"] });
            }
            scope.loginUserid = mainDataServer.loginUser.id;
            scope.$watch("item.isSelected", function(newValue: boolean, oldValue: boolean) {
                if (newValue == oldValue) {
                    return;
                }
                // if (newValue && scope.item.id == mainDataServer.loginUser.id) {
                //     webimutil.Helper.alertMessage.error("您不可以将自己删除", 2);
                //     scope.item.isSelected = false;
                // }
            })
        }
    }
}])

// groupInfo.directive("groupBulletin", [function() {
//     return {
//         restrict: "E",
//         scope: { message: "=", maxlength: "=", loadedfocus: "@" },
//         template: '<div class="input-wrap">' +
//         '<div class="textarea-wrap" style="height: 140px;">' +
//         '<div class="textarea-bg" style="display: block;" ng-show="showplaceholder">' +
//         '<span class="prompt-text">请编辑群公告</span>' +
//         '</div>' +
//         '<textarea class="joinGroupInfo textarea" ng-model="message"></textarea>' +
//         '</div>' +
//         // '<i class="iconfont-smile"></i>' +
//         '<div class="wordsLen"><span class="word_start">{{message.length}}</span>/{{maxlength}}</div>' +
//         '</div>',
//         link: function(scope: any, ele: angular.IRootElementService, attrs: angular.IAttributes) {
//             scope.showplaceholder = true;
//             scope.maxlength = scope.maxlength || 64;
//             if (scope.loadedfocus) {
//                 angular.element(ele).find("textarea")[0].focus();
//                 scope.showplaceholder = true;
//             }
//
//             ele.find("textarea").bind("focus", function() {
//                 // scope.showplaceholder = false;
//                 // scope.$apply();
//             });
//
//             ele.find("textarea").bind("blur", function() {
//                 if (!scope.message || !scope.message.length) {
//                     scope.showplaceholder = true;
//                 }
//                 scope.$apply();
//             });
//
//             ele.find("textarea").bind('input propertychange', function () {
//               if (!scope.message || !scope.message.length) {
//                   scope.showplaceholder = true;
//               }
//               else{
//                  scope.showplaceholder = false;
//               }
//               scope.$apply();
//             });
//
//             scope.message = scope.message || "";
//             if(scope.message){
//               scope.showplaceholder = false;
//             }
//             scope.$watch("message", function(newVal: any, oldVal: any) {
//                 if (newVal.length > scope.maxlength) {
//                     scope.message = newVal.substring(0, scope.maxlength);
//                 }
//             });
//         }
//     }
// }]);
