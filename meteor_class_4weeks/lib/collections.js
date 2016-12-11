// documents collection
this.Documents = new Mongo.Collection("documents");
// editing users collection
EditingUsers = new Mongo.Collection("editingUsers");
Comments = new Mongo.Collection("comments");
Comments.attachScheme(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max:200
  },
  body:{
    type: String,
    label: "Comment",
    max:1000
  }
}));
