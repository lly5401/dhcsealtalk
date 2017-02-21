/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var notification = angular.module("webim.notification", []);

notification.controller("notificationController", ["$scope", "$state", "mainDataServer",
    function($scope: any, $state: angular.ui.IStateService, mainDataServer: mainDataServer) {
        $scope.back = function() {
            $state.go("main")
        }

        $scope.notificationList = mainDataServer.notification.notificationList;

    }]);


notification.directive("applyfriendNotice", ["mainServer", "mainDataServer",
    function(mainServer: mainServer, mainDataServer: mainDataServer) {
        return {
            restrict: "E",
            scope: { item: "=" },
            template: '<li class="clearfix">' +
            '<div class="center">请求添加你为好友</div>' +
            '<div class="left">' +
            '<div class="photo">' +
            '<img class="img" ng-show="item.portraitUri" ng-src="{{item.portraitUri||\'./assets/img/barBg.png\'}}" alt="">' +
            '<div class="portrait" ng-show="!item.portraitUri">{{item.firstchar}}</div>' +
            '</div>' +
            '<div class="info">' +
            '<h3 class="nickname">' +
            '<span class="nickname_text">{{item.name}}</span>' +
            '</h3>' +
            '<p class="remarks">' +
            '<span class="ng-binding ng-scope">{{item.content}}</span>' +
            '</p>' +
            '</div>' +
            '</div>' +
            '<div class="right"><button class="functionBoxBtn" ng-show="!item.isFriend">接受</button><p class="" ng-show="item.isFriend">已添加</p></div>' +
            '</li>',
            link: function(scope: any, ele: any, attr: any) {
                angular.element(ele[0].getElementsByClassName("portrait")[0]).css("background-color", webimutil.Helper.portraitColors[scope.item.id.charCodeAt(0) % webimutil.Helper.portraitColors.length]);

                ele.find("button").on("click", function() {
                    var friend = mainDataServer.contactsList.getFriendById(scope.item.id);
                    if (friend) {
                        scope.item.isFriend = true;
                        scope.item.status = webimmodel.FriendStatus.Agreed;
                        webimutil.Helper.alertMessage.error("已经是好友了");
                    } else {
                        mainServer.friend.agree(scope.item.id).success(function() {
                            scope.item.isFriend = true;
                            scope.item.status = webimmodel.FriendStatus.Agreed;
                            mainDataServer.contactsList.addFriend(new webimmodel.Friend({ id: scope.item.id, name: scope.item.name, imgSrc: scope.item.portraitUri }))

                        }).error(function(e) {
                            console.log(e);
                        })
                    }
                })
            }
        }
    }]);

notification.directive("applygroupNotice", ["mainServer", "RongIMSDKServer",
    function(mainServer: mainServer, RongIMSDKServer: RongIMSDKServer) {
        return {
            restrict: "E",
            scope: { item: "=" },
            template: '<li class="clearfix">' +
            '<div class="center">申请加入“{{item.data.groupName}}”</div>' +
            '<div class="left">' +
            '<div class="photo">' +
            '<img class="img" ng-src="{{item.senderUserImgSrc||\'./assets/img/barBg.png\'}}" alt="">' +
            '</div>' +
            '<div class="info">' +
            '<h3 class="nickname">' +
            '<span class="nickname_text">{{item.senderUserName}}</span>' +
            '</h3>' +
            '<p>' +
            '<span class="ng-binding ng-scope">{{item.data.message}}</span>' +
            '</p>' +
            '</div>' +
            '</div>' +
            '<div class="right"><button class="functionBoxBtn" ng-show="!agree">通过</button><p class="hide">已通过</p></div>' +
            '</li>',
            link: function(scope: any, ele: any, attr: any) {

                ele.find("button").on("click", function() {
                    //同意加我好友， 1请求服务器2发送通知

                })
            }
        }
    }]);

notification.directive("inviteAddGroup", ["mainServer", "mainDataServer",
    function(mainServer: mainServer, mainDataServer: mainDataServer) {
        return {
            restrict: "E",
            scope: { item: "=" },
            template: '<li class="clearfix  systemMes" >' +
            '<div class="left">' +
            '<div class="photo">' +
            '<img class="img" ng-src="{{item.senderUserImgSrc||\'./assets/img/barBg.png\'}}" alt="">' +
            '</div>' +
            '<div class="info">' +
            '<h3 class="nickname">' +
            '<span class="nickname_text">{{item.senderUserName}}</span>' +
            '</h3>' +
            '<p>' +
            '<span class="ng-binding ng-scope"></span>' +
            '</p>' +
            '</div>' +
            '</div>' +
            '<div class="center">{{item.senderUserName}}邀请加入“{{item.data.groupName}}”</div>' +
            '<div class="right"><button class="functionBoxBtn"  ng-show="!agree">通过</button><p class="hide">已通过</p></div>' +
            '</li>',
            link: function(scope: any, ele: any, attr: any) {
                //
                // ele.find("button").on("click", function() {
                //     //同意加我好友， 1请求服务器2发送通知
                //
                // })
            }
        }
    }]);

notification.directive("warningNotice", [function() {
    return {
        restrict: "E",
        scope: { item: "=" },
        template: '<li class="clearfix systemMes">' +
        '<div class="left">' +
        '<div class="photo">' +
        '<img class="img" src="./assets/img/barBg.png" alt="">' +
        '</div>' +
        '<div class="info">' +
        '<h3 class="nickname">' +
        '<span class="nickname_text"></span>' +
        '</h3>' +
        '<p>' +
        '<span class="ng-binding ng-scope"></span>' +
        '</p>' +
        '</div>' +
        '</div>' +
        '<div class="center">{{item.content}}</div>' +
        '<div class="right"><button class="functionBoxBtn hide">通过</button><p class="">已通过</p></div>' +
        '</li>',
        link: function(scope: any, ele: any, attr: any) {

            if (scope.item.operation && scope.item.operation == "AcceptResponse") {
                scope.item.content = scope.item.senderUserName + scope.item.content;
            } else if (scope.item.data) {
                switch (scope.item.data.type) {
                    case webimmodel.CommandNotificationMessageType.AcceptApplyGroup:
                        scope.item.content = scope.item.content + scope.item.data.groupName
                        break;
                    case webimmodel.CommandNotificationMessageType.AcceptInviteAddGroup:
                        scope.item.content = scope.item.data.userName + scope.item.content + scope.item.data.groupName
                        break;
                }
            }


        }
    }
}])
