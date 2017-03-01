/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../../typings/angular-file-upload/angular-file-upload.d.ts"/>

var account = angular.module("webim.account", ["webim.main.server"]);


account.controller("signinController", ["$scope", "$state", "mainServer", "mainDataServer", "conversationServer", "RongIMSDKServer",
    function ($scope: any, $state: angular.ui.IStateService, mainServer: mainServer, mainDataServer: mainDataServer, conversationServer: conversationServer, RongIMSDKServer: RongIMSDKServer) {
        //判断参数是否为空    
        var userPhone = $state.params["userPhone"];//用户登录的用户名及电话号码
        var orderId = $state.params["orderId"];//订单ID
        //获取订单id

        if (!userPhone) {
            alert("没有用户电话");
            return;
        }

        //这要考虑是否清除聊天记录
        conversationServer.historyMessagesCache = {};//清空历史消息
        mainDataServer.conversation.conversations = [];//清空会话列表

        if (RongIMLib.RongIMClient && RongIMLib.RongIMClient.getInstance) {
            try {
                RongIMSDKServer.logout();
                //清除之前会话列表SDK问题 TODO:SDK2.0 logout时已清除
                // var carr = RongIMSDKServer.conversationList();
                // carr.splice(0, carr.length);
            } catch (e) {

            }

        }
        webimutil.CookieHelper.removeCookie("loginuserid");//清除登录状态
        mainDataServer.loginUser = new webimmodel.UserInfo();//清除用户信息
        mainServer.user.signin(userPhone, "86", '1', 'B').success(function (rep) {
            if (rep.code === 200) {
                // 登录账户
                mainDataServer.loginUser.id = rep.result.id;
                //alert(rep.result.id);
                mainDataServer.loginUser.token = rep.result.token;
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + 30);
                webimutil.CookieHelper.setCookie("loginuserid", rep.result.id, exdate.toGMTString());
                webimutil.CookieHelper.setCookie("loginusertoken", rep.result.token, exdate.toGMTString());
                //进入主页面前先创建分组
                var idorname = orderId;//'test_group';//订单ID
                var membersid = <string[]>[];
                membersid.push(mainDataServer.loginUser.id);//先将自己加入群聊
                mainServer.group.create(idorname, membersid, idorname).success(function (rep) {
                    if (rep.code == 200) {
                        var group = new webimmodel.Group({
                            id: rep.result.id,
                            name: idorname,
                            imgSrc: "",
                            upperlimit: 500,
                            fact: 1,
                            creater: mainDataServer.loginUser.id
                        });
                        mainDataServer.contactsList.addGroup(group);
                        membersid = undefined;
                        //alert(1);
                        var cvsType = 'gt' ;//设置请来源
                        $state.go("main",{cvsType:cvsType,groupId:group.id});
                        //webimutil.Helper.alertMessage.success("创建成功！", 2);
                        //调到当前群聊天页面暂时不用
                        //$state.go("main.chat", { targetId: group.id, targetType: webimmodel.conversationType.Group });
                    } else if (rep.code == 1000) {
                        //群组超过上限
                        webimutil.Helper.alertMessage.error("群组超过上限", 2);
                    }
                    //进入主聊天界面
                    
                }).error(function (err) {
                    webimutil.Helper.alertMessage.error("失败2", 2);
                });



            } else if (rep.code === 1000) {
                //用户或密码错误
                $scope.userorpwdIsError = true;
            } else {

            }
        }).error(function (error, code) {
            if (code == 400) {
                webimutil.Helper.alertMessage.error("无效的手机号", 2);
            }
        });
    }])

//创建群聊

//验证用户名是否有效暂时没用
account.directive("usernameAvailable", ["$http", "$q", "mainServer",
    function ($http: angular.IHttpService, $q: angular.IQService, mainServer: mainServer) {
        return {
            require: "ngModel",
            link: function (scope: any, ele: angular.IRootElementService, attr: any, ngModel: angular.INgModelController) {
                if (ngModel) {
                    var usernameRegexp = /^[a-z0-9A-Z_]{4,64}$/;
                }
                var customValidator = function (value: string) {
                    var validity = ngModel.$isEmpty(value) || usernameRegexp.test(value);
                    ngModel.$setValidity("userformat", validity);
                    return validity ? value : undefined;
                };
                ngModel.$formatters.push(customValidator);
                ngModel.$parsers.push(customValidator);

                ngModel.$asyncValidators['uniqueUsername'] = function (modelValue: any, viewValue: any) {
                    var value = modelValue || viewValue;
                    return mainServer.user.checkUsernameAvailable(value).then(function resolved(res) {
                        if (res.data && res.data.result) {
                            return true
                        }
                        else {
                            return $q.reject(res.data);
                        }

                    }, function rejected() {
                    })
                };
            }
        }
    }]);
//验证电话号码是否有效暂时没用
account.directive("phoneAvailable", ["$http", "$q", "mainServer",
    function ($http: angular.IHttpService, $q: angular.IQService, mainServer: mainServer) {
        return {
            require: "ngModel",
            link: function (scope: any, ele: angular.IRootElementService, attr: any, ngModel: angular.INgModelController) {
                if (ngModel) {
                    var phoneRegexp = /^1[3-9][0-9]{9,9}$/;
                }
                var customValidator = function (value: string) {
                    var validity = ngModel.$isEmpty(value) || phoneRegexp.test(value);
                    ngModel.$setValidity("phoneformat", validity);
                    return validity ? value : undefined;
                };
                ngModel.$formatters.push(customValidator);
                ngModel.$parsers.push(customValidator);

                ngModel.$asyncValidators['uniquephone'] = function (modelValue: any, viewValue: any) {
                    var value = modelValue || viewValue;
                    return mainServer.user.checkPhoneAvailable(value, "86").then(function resolved(res) {
                        if (res.data && res.data.result) {
                            return true
                        }
                        else {
                            return $q.reject(res.data);
                        }

                    }, function rejected() {
                    })
                };
            }
        }
    }]);
//电话注册暂时没用
account.directive("phoneRegistered", ["$http", "$q", "mainServer",
    function ($http: angular.IHttpService, $q: angular.IQService, mainServer: mainServer) {
        return {
            require: "ngModel",
            link: function (scope: any, ele: angular.IRootElementService, attr: any, ngModel: angular.INgModelController) {
                if (ngModel) {
                    var phoneRegexp = /^1[3-9][0-9]{9,9}$/;
                }
                var customValidator = function (value: string) {
                    var validity = ngModel.$isEmpty(value) || phoneRegexp.test(value);
                    ngModel.$setValidity("phoneformat", validity);
                    return validity ? value : undefined;
                };
                ngModel.$formatters.push(customValidator);
                ngModel.$parsers.push(customValidator);

                ngModel.$asyncValidators['uniquephone'] = function (modelValue: any, viewValue: any) {
                    var value = modelValue || viewValue;
                    return mainServer.user.checkPhoneAvailable(value, "86").then(function resolved(res) {
                        if (res.data && res.data.result) {
                            return $q.reject(res.data);
                        }
                        else {
                            return true
                        }

                    }, function rejected() {
                    })
                };
            }
        }
    }])
//发送验证码暂时没用
account.directive("sendCodeButton", ["$interval", "mainServer", function ($interval: angular.IIntervalService, mainServer: mainServer) {
    return {
        restrict: "E",
        scope: {
            phone: "=",
            region: "=",
            available: "=",
            startTime: "@timespan",
            loading: "="
        },
        template: '<span class="sendCode" ng-show="codeTime==0"  ng-click="sendCode()">' +
        '<a href="javascript:void 0">发送验证码</a>' +
        '</span>' +
        // '<span class="sec" ng-show="codeTime==0">{{startTime}} s</span>' +
        '<span class="sec" ng-show="codeTime>0">{{codeTime}} s</span>',
        link: function (scope: any, ele: angular.IRootElementService, attr: any) {
            scope.codeTime = 0;
            scope.startTime = scope.startTime || 60;
            scope.region = scope.region || "86";

            scope.sendCode = function () {
                if (scope.codeTime == 0 && scope.available) {
                    mainServer.user.sendCode(scope.phone, "86").success(function (rep) {
                        if (rep.code == 200) {
                            scope.loading = true;
                            scope.codeTime = scope.startTime;
                            scope.interval = $interval(function () {
                                if (scope.codeTime > 0) {
                                    scope.codeTime = scope.codeTime - 1;
                                } else {
                                    scope.loading = false;
                                    $interval.cancel(scope.interval);
                                }
                            }, 1000);
                        } else if (rep.code == 5000) {
                            webimutil.Helper.alertMessage.error("发送频率过快，请稍后再发", 2);
                        }
                    }).error(function (error, code) {
                        if (code == 400) {
                            webimutil.Helper.alertMessage.error("无效手机号", 2);
                        }
                    })
                }
            }
        }
    }
}]);
