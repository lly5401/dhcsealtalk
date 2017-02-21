/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var createGroup = angular.module("webim.creategroup", []);

createGroup.controller("creategroupController", ["$scope", "$state",
    function($scope: any, $state: angular.ui.IStateService) {
        $scope.groupName = "";

        $scope.submite = function() {
            var name = ($scope.groupName || "").trim();
            if (name.length >= 2 && name.length <= 10) {
                $state.go("main.groupaddmember", { iscreate: "true", idorname: $scope.groupName })
            } else {
                webimutil.Helper.alertMessage.error("名称长度2-10", 2);
            }

        }

        document.getElementById("groupName").onkeydown = function(e) {
            if (e.keyCode == 13 || e.keyCode == 10) {
                $scope.submite();
            }
        }

        $scope.back = function() {
            // $state.go("main")
            window.history.back();
        }
    }]);
