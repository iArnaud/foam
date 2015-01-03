/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
CLASS({
  name:  'Logo',
  extendsModel: 'foam.graphics.CView',

  constants: {
    COLOURS: ['#33f','#f00','#fc0','#33f','#3c0']
  },

  properties: [
    {
      name: 'timer',
      factory: function() { return Timer.create(); },
      postSet: function(_, timer) {
        var self = this;
        Events.dynamic(
          function() { self.timer.time; },
          function() { self.paint(); });
      }
    }
  ],

  methods: {
    paintChildren: function() {
      this.SUPER();
      var c = this.canvas;

//      if ( Math.random() > 0.2 ) return;

      //var Y = 210-80*Math.sin(this.timer.time/4000*(Math.PI*2));
      var Y = 100;
//      var X = 280-180*Math.sin(this.timer.time/4000*(Math.PI*2));
      var X = 100+40+Math.random()*220;

      var circle = Circle.create({
        x: X,
        y: Y,
        r: 5,
        color: undefined,
        borderWidth: 2,
        border: this.COLOURS[Math.floor(Math.random() * this.COLOURS.length)]});

      this.addChild(circle);
      var M = Movement;

      M.compile([
        [
          [4000, function() {
            circle.x = circle.x + Math.random()*50;
//            circle.alpha = 0;
            circle.alpha = 0.3;
           },
           Math.sqrt
          ],
          [4000, function() {
            circle.y = Y - 100 - Math.random() * 50;
            circle.r = 25 + Math.random() * 50;
            circle.borderWidth = 12;
           },
           M.easeIn(0.5)
          ]
        ],
        (function() { this.removeChild(circle); }).bind(this)
      ])();
    }
  }
});


CLASS({
  name:  'Logo2',
  extendsModel: 'foam.graphics.CView',

  properties: [
    {
      name: 'text',
      defaultValue: 'FOAM'
    }
  ],

  methods: {
    paintSelf: function() {
      this.SUPER();
      var c = this.canvas;

      c.fillStyle = 'black';
      c.fillRect(100, 0, 360, 120);

      c.font = '120px Georgia';
      c.strokeStyle = 'black';
      c.fillStyle = 'rgba(0,0,0,1)';
      c.globalCompositeOperation = 'destination-out';
      c.fillText(this.text, 100, 100);
    }
  }
});