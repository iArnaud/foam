/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var canv = X.CView2.create({width: 1000, height: 300});
canv.write(document);


var view = X.canvas.LinearLayout.create({width: 120, height: 300});
canv.addChild(view);

MODEL({
  name: 'LRectangle',
  extendsModel: 'canvas.Rectangle',
  traits: [ 'layout.LayoutItemHorizontalTrait' ],
  
  methods: {
    init: function() {
      this.SUPER();
      
    }
  }
  
});
MODEL({
  name: 'LRectangle2',
  extendsModel: 'canvas.Rectangle',
  traits: [ 'layout.LayoutItemHorizontalTrait' ],

  methods: {
    init: function() {
      this.SUPER();

      this.horizontalConstraints.min.val = 50;
      this.horizontalConstraints.max.val = 400;
      this.horizontalConstraints.preferred.val = 200;
      this.horizontalConstraints.shrinkFactor = 1;
    }
  }

});

var rect1 = view.X.LRectangle.create({
       x: 0,
       y: 20,
       border: 'black',
       width: 120,
       height: 30,
  
});
view.addChild(rect1);

var rect2 = view.X.LRectangle2.create({
       x: 60,
       y: 25,
       border: 'blue',
       width: 120,
       height: 30,
  
});
view.addChild(rect2);

var rect3 = view.X.LRectangle.create({
       x: 120,
       y: 30,
       border: 'red',
       width: 120,
       height: 30,
  
});
view.addChild(rect3);

//view.performLayout();
var mouse = X.Mouse.create();
mouse.connect(canv.$);

Events.dynamic(function() { mouse.x; mouse.y; }, function() {
  view.width = mouse.x;
  view.height = mouse.y;
});

var editor1 = X.DetailView.create({ data: rect1.horizontalConstraints });
editor1.write(document);

var editor2 = X.DetailView.create({ data: rect2.horizontalConstraints });
editor2.write(document);

var editor3 = X.DetailView.create({ data: rect3.horizontalConstraints });
editor3.write(document);

// var label = X.canvas.Label.create({
//      x: 20,
//      y: 20,
//      color: 'black',
//      width: 100,
//      height: 30,
//      text: "hello world",
//      font: "12pt Roboto"
//    });
// var box = X.canvas.Rectangle.create({
//     x: 10,
//     y: 10,
//     color: '#ff00ff',
//     width: 100,
//     height: 20,
//     border: "blue"
//   });
//
// var circle = X.Circle2.create({
//    x: 10,
//    y: 10,
//    color: 'red',
//    radius: 20,
//
//  });
//
// view.addChild(box);
// view.addChild(circle);
// view.addChild(label);

