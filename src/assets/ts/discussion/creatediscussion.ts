/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var createDiscussion = angular.module("webim.creatediscussion", []);

createDiscussion.controller("creatediscussionController", ["$scope", "$state",
    function($scope: any, $state: angular.ui.IStateService) {
        $scope.discussionName = "";

        $scope.submite = function() {
            var name = ($scope.discussionName || "").trim();
            if (name.length >= 2 && name.length <= 32) {
                $state.go("main.discussionaddmember", { iscreate: "true", idorname: $scope.discussionName })
            } else {
                webimutil.Helper.alertMessage.error("名称长度2-32", 2);
            }

        }

        document.getElementById("discussionName").onkeydown = function(e) {
            if (e.keyCode == 13 || e.keyCode == 10) {
                $scope.submite();
            }
        }

        $scope.back = function() {
            $state.go("main")
        }
    }]);
