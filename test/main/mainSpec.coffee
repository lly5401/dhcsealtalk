describe "webimserver",->
  # it "hh",->
  #   expect(1).toBe 1
  beforeEach module 'webim.main.server'

  mainDataServer=undefined

  beforeEach inject(( _mainDataServer_) ->
    mainDataServer=_mainDataServer_
  )

  describe "联系人",->

    it "添加好友",->
      friend=new webimmodel.Friend({
        id:"id"
        name:"name"
        imgSrc:"imageUri"
        })
      mainDataServer.contactsList.addFriend friend
      console.log mainDataServer.contactsList.friendList
      expect(mainDataServer.contactsList.friendList.length).toBe 1
