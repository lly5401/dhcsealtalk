/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var addgroup = angular.module("webim.addgroup", []);

addgroup.controller("searchgroupController", ["$scope", "$state",
    function($scope: any, $state: angular.ui.IStateService) {

        $scope.grouplist = <any>[];

        $scope.searchgroup = function(content: string) {
            //需要请求服务器
            $scope.grouplist = [{ groupName: "群组一（静态数据）", groupId: "group1" },
                { groupName: "群组二（静态数据）", groupId: "group2" }];
        }

        $scope.back = function() {
            // $state.go("main");
            window.history.back();
        }
    }]);

addgroup.controller("applygroupController", ["$scope", "$state", "$stateParams", "mainServer", "mainDataServer",
    function($scope: any, $state: angular.ui.IStateService, $stateParams: angular.ui.IStateParamsService, mainServer: mainServer, mainDataServer: mainDataServer) {
        // $scope.applygroupbtn = function() {
        //     var groupId = $stateParams["groupId"];
        //     var groupName = $stateParams["groupName"];
        //
        //     $scope.title = groupName;
        //     //申请加群  给群组创建者发送通知消息
        //
        //     console.log("未实现：加入群组" + groupId)
        // }

        $scope.back = function() {
            $state.go("main.searchgroup");
        }
    }])

addgroup.directive("addgroupitem", ["$state", "mainDataServer",
    function($state: angular.ui.IStateService, mainDataServer: mainDataServer) {
        return {
            restrict: "E",
            scope: {
                item: "="
            },
            template: '<li class="chat_item joinGroup_item">' +
            '<div class="photo">' +
            '<img class="img" src="assets/img/barBg.png" alt="">' +
            '</div>' +
            '<div class="info">' +
            '<h3 class="nickname">' +
            '<span class="nickname_text">{{item.groupName}}</span>' +
            '</h3>' +
            '<p class="msg ng-scope">' +
            '<span>( 28/500 )</span>' +
            '</p>' +
            '<button class="functionBoxBtn" ng-click="applygroupsrc()">申请</button>' +
            '</div>' +
            '</li>',
            link: function(scope: any, ele: angular.IRootElementService, attr: any) {
                scope.applygroupsrc = function() {
                    if (mainDataServer.contactsList.getGroupById(scope.item.groupId)) {
                        alert("您已经在群组里");
                        return;
                    }
                    $state.go("main.applygroup", { groupId: scope.item.groupId });
                }
            }
        }
    }])
