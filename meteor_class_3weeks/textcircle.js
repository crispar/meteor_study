this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
	Meteor.subscribe("documents");
	Meteor.subscribe("editingUsers");
	Template.editor.helpers({
		docid:function(){
			setupCurrentDocument();
			return Session.get("docid");
		},
		config:function(){
			return function(editor){
				editor.setOption("lineNumbers", true);
				editor.setOption("theme", "cobalt");
				editor.on("change", function(cm_editor, info) {
					$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
					Meteor.call("addEditingUser");
				});
			}
		},
	});

	Template.editingUsers.helpers({
		users:function(){
			var doc, eusers, users;
			doc = Documents.findOne();
			if (!doc) {return;}// give up
			eusers = EditingUsers.findOne({docid:doc._id});
			if (!eusers) {return;}// give up
			users = new Array();
			var i = 0;
			for (var user_id in eusers.users) {
				console.log("adding a user ");
				console.log(eusers.users[user_id]);
				users[i] = fixObjectKeys(eusers.users[user_id]);
				i++;
			}
			return users;
		}
	})
	
	Template.navbar.helpers({
		documents:function(){
			return Documents.find();
		}
	})

	Template.docMeta.helpers({
		document:function(){
			return Documents.findOne({_id:Session.get("docid")});
		},
		canEdit:function(){
			var doc;
			doc = Documents.findOne({_id:Session.get("docid")});
			if(doc){
				if(doc.owner == Meteor.userId()){
					return true;
				}
			}
			return false;
		}
	})

	Template.editableText.helpers({
		userCanEdit:function(doc,Collection) {
			// can edit if the current doc is owned by me.
			doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
			if (doc) {
				return true;
			} else {
				return false;
			}
		}
	})

    Template.navbar.events({
		"click .js-add-doc":function(event){
			event.preventDefault();
			console.log("Add a new doc!");
			if (!Meteor.user()) {//user not available
				alert("You need to login first")
			} else {
				// they are logged in ... lets insert a doc
				var id = Meteor.call("addDoc", function(err, res){
					if (!err) {
						console.log("event callback received id: " + res);
						Session.set("docid", res);
					}
				});
			}
		},
		"click .js-load-doc":function(event){
			console.log(this);
			Session.set("docid", this._id);
		}
	})

	Template.docMeta.events({
		"click .js-tog-private":function(event){
			console.log(event.target.checked);
			var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
			Meteor.call("updateDocPrivacy", doc);
			Meteor.call("testMethod", function(){
				console.log("method callback!");
			})
			console.log("After the method!");
			console.log("1. start");
			console.log($(event.target).data());
			console.log("2. start");
			console.log(Event.target);
			console.log("3. start");
			console.log(this);
			console.log("4. start");
			console.log(Documents.findOne());
		}
	})

}// end isClient...

if (Meteor.isServer) {
  Meteor.startup(function () {
    // insert a document if there isn't one already
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });

  Meteor.publish("documents", function() {
  	return Documents.find({
		$or:[
			{isPrivate:false},
			{owner:this.userId}
		]
	});
  })
  Meteor.publish("editingUsers", function() {
  	return EditingUsers.find();
  })
}

Meteor.methods({
	addDoc:function(){
		var doc;
		if (!this.userId) { // not logged in
			return;
		}
		else {
			doc = {owner:this.userId, createdOn:new Date(),
				title:"my new doc"};
			var id = Documents.insert(doc);
			console.log("addDoc method: got an id " + id);
			return id;

		}
	},
	updateDocPrivacy:function(doc) {
		console.log("updateDocPrivacy method");
		console.log("1.userid : " + this.userId);
		console.log("2.userid : " + Meteor.userId);
		console.log("3.userid : " + Meteor.user()._id);
		console.log("4.userid : " + this.user()._id);
		console.log(doc);
		var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
		if(realDoc) {
			realDoc.isPrivate = doc.isPrivate;
			Documents.update({_id:doc._id}, realDoc);
		}
	},
	testMethod:function(){
		console.log("In testMethod()");
	},
	addEditingUser:function(){
		var doc, user, eusers;
		doc = Documents.findOne();
		if (!doc) { return; } //no doc give
		if (!this.userId) { return; } //no logged in user give up
		//now I haved a dock and possibly a user
		user = Meteor.user().profile;
		eusers = EditingUsers.findOne({docid:doc._id});
		if (!eusers) {
			eusers = {
				docid:doc._id,
				users:{},
			};
		}
		user.lastEdit = new Date();
		eusers.users[this.userId] = user;

		EditingUsers.upsert({_id:eusers._id}, eusers);
	}
})

function setupCurrentDocument(){
	var doc;
	if(!Session.get("docid")) {
		doc = Documents.findOne();
		if (doc) {
			Session.set("docid", doc._id);
		}
	}
}

function fixObjectKeys(obj) {
	var newObj = {};
	for ( key in obj) {
		var key2 = key.replace("-","");
		newObj[key2] = obj[key];
	}
	return newObj;
}
