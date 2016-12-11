// code sent to client and server
// which gets loaded before anything else (since it is in the lib folder)
this.Documents = new Mongo.Collection("documents");
// editing users collection
EditingUsers = new Mongo.Collection("editingUsers");
Comments = new Mongo.Collection("comments");

Comments.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max:200
  },
  body:{
    type: String,
    label: "Comment",
    max:1000
  },
  docId:{
    type: String,
  },
  owner:{
    type: String, 
  },
}));
