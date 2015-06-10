module("Basic Tests");

/*
test("truthy", function() {
  ok(true, "true is truthy");
  equal(1, true, "1 is truthy");
  notEqual(0, true, "0 is NOT truthy");
});
*/

window.onload = function() {
   test("Document Query", function() {
      notEqual(window, undefined);
      notEqual(document, undefined);
      notEqual(document.createElement('div'), undefined);
      
      var div = $('<div>');
      ok(1, 1);
     // ok(div[0].children[0].nodeName === 'INPUT', 'Creating div and input');
   });
   
   
   
}