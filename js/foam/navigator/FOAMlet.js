/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'FOAMlet',
  package: 'foam.navigator',

  properties: [
    {
      model_: 'StringProperty',
      name: 'iconURL',
      label: 'Icon',
      todo: multiline(function() {/*
        Add support for (1) rendering icons, and (2) icon import (upload, etc.)
      */})
    },
    {
      model_: 'StringProperty',
      name: 'name'
    },
    {
      model_: 'DateTimeProperty',
      name: 'lastModified',
      factory: function() {
        return Date.now();
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'labels',
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        this.addListener(function(model, o, notificationData) {
          debugger;
          if ( notificationData[0] !== 'property' ||
              notificationData[1] === 'lastModified' ||
              ! model || ! model.properties ) return;
          var propName = notificationData[1];
          var propMatch = model.properties.filter(function(propName, prop) {
            return prop.name == propName;
          }.bind(this, propName))[0];
          if ( ! propMatch || propMatch.hidden ) return;
          console.log('Updating lastModified');
          o.lastModified = Date.now();
        }.bind(this, this.model_));
      }
    }
  ]
});
