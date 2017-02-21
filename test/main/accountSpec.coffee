describe "账户部分测试",->
  userinfo=
    accountNumber:undefined
    passWord:undefined
  userorpwdIsError:undefined

  $scope=undefined
  
  beforeEach module "webim.account"

  beforeEach inject((_$rootScope_, _$compile_)->
    $compile = _$compile_
    $rootScope = _$rootScope_
  )
