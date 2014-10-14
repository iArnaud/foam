/**
 * Material Design GMail.
 **/
EMail.ARCHIVE.iconUrl = 'icons/ic_archive_black_24dp.png';
EMail.ARCHIVE.label = '';

EMail.TRASH.iconUrl = 'icons/ic_delete_black_24dp.png';
EMail.TRASH.label = '';

EMail.REPLY.iconUrl = 'icons/ic_reply_black_24dp.png';
EMail.REPLY.label = '';

EMail.REPLY_ALL.iconUrl = 'icons/ic_reply_all_black_24dp.png';
EMail.REPLY_ALL.label = '';

EMail.SPAM.iconUrl = 'icons/ic_report_black_24dp.png';
EMail.SPAM.label = '';

EMail.FORWARD.iconUrl = 'icons/ic_forward_black_24dp.png';
EMail.FORWARD.label = '';

EMail.STAR.iconUrl = 'icons/ic_star_black_24dp.png';
EMail.STAR.label = '';

EMail.MOVE_TO_INBOX.iconUrl = 'icons/ic_inbox_black_24dp.png';
EMail.MOVE_TO_INBOX.label = '';

EMail.SEND.iconUrl = 'icons/ic_send_black_24dp.png';
EMail.SEND.label = '';

EMail.MARK_UNREAD.iconUrl = 'icons/ic_markunread_black_24dp.png';
EMail.MARK_UNREAD.label = '';

/** Modify the default QueryParser so that label ids are looked up in the EMailLabels DAO. **/
var queryParser = {
  __proto__: QueryParserFactory(EMail),

  id: sym('string'),

  labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
}.addActions({
  id: function(v) {
     return OR(
        CONTAINS_IC(EMail.TO, v),
        CONTAINS_IC(EMail.FROM, v),
        CONTAINS_IC(EMail.SUBJECT, v),
        CONTAINS_IC(EMail.BODY, v));
  },

  labelMatch: function(v) {
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(EQ(EMail.LABELS, values[i]))
    }
    return or;
  }
});

queryParser.expr = alt(
  sym('labelMatch'),
  queryParser.export('expr')
);


MODEL({
  name: 'MGmail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  properties: [
    {
      name: 'controller',
      subType: 'AppController',
      postSet: function(_, controller) {
        var view = controller.__ctx__.DetailView.create({data: controller});
        this.stack.setTopView(FloatingView.create({ view: view }));
      }
    },
    { name: 'oauth' },
    {
      name: 'emailDao',
      type: 'DAO',
      factory: function() {
        return this.__ctx__.LimitedLiveCachingDAO.create({
          cacheLimit: 10,
          src: this.__ctx__.GMailToEMailDAO.create({
            delegate: this.__ctx__.GMailMessageDAO.create({})
//            delegate: this.__ctx__.StoreAndForwardDAO.create({
//              delegate: this.__ctx__.GMailMessageDAO.create({})
//            })
          }),
          cache: this.__ctx__.CachingDAO.create({
              src: this.__ctx__.IDBDAO.create({
                  model: this.__ctx__.EMail
              }),
              cache: this.__ctx__.MDAO.create({ model: this.__ctx__.EMail })
          })
        });
      }
    },
    {
      name: 'labelDao',
      type: 'DAO',
      factory: function() {
        return this.__ctx__.CachingDAO.create({
          src: this.__ctx__.GMailRestDAO.create({ model: GMailLabel }),
          cache: this.__ctx__.MDAO.create({ model: GMailLabel }),
        });
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return this.__ctx__.StackView.create(); },
      postSet: function(old, v) {
        if ( old ) {
          Events.unfollow(this.width$, old.width$);
          Events.unfollow(this.height$, old.height$);
        }
        Events.follow(this.width$, v.width$);
        Events.follow(this.height$, v.height$);
      }
    }
  ],

  methods: {
    init: function() {
      this.__ctx__ = this.__ctx__.sub({
        touchManager: this.__ctx__.TouchManager.create({})
      }, 'MGMAIL CONTEXT');
      this.__ctx__.gestureManager = this.__ctx__.GestureManager.create({});

      this.oauth = this.__ctx__.EasyOAuth2.create({
        clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
        clientSecret: "GTkp929u268_SXAiHitESs-1",
        scopes: [
          "https://mail.google.com/"
        ]
      });

      this.__ctx__.registerModel(XHR.xbind({
        authAgent: this.oauth,
        retries: 3,
        delay: 10
      }), 'XHR');

      this.SUPER();
    },

    toHTML: function() { return this.stack.toHTML(); },

    initHTML: function() {
      this.stack.initHTML();

      var Y = this.__ctx__.sub({
        stack: this.stack,
        EMailDAO: this.emailDao,
        mgmail: this, // TODO: this doesn't actually work.
      }, 'GMAIL CONTEXT');

      var toTop = function(id) {
        return {
          compare: function(o1, o2) {
            return o1.id == id ? -1 : o2.id == id ? 1 : 0;
          }
        };
      };

      this.controller = Y.AppController.create({
        model: EMail,
        dao: this.emailDao,
        createAction: this.model_.COMPOSE,
        citationView: 'EMailCitationView',
        queryParser: queryParser,
        editableCitationViews: true,
        sortChoices: [
          [ DESC(EMail.TIMESTAMP), 'Newest First' ],
          [ EMail.TIMESTAMP, 'Oldest First' ],
          [ EMail.SUBJECT, 'Subject' ],
        ],
        menuFactory: function() {
          return this.__ctx__.MenuView.create({
            topSystemLabelView: this.__ctx__.DAOListView.create({
              dao: this.__ctx__.mgmail.labelDao
                  .where(EQ(GMailLabel.TYPE, 'system'))
                  .orderBy(
                    toTop('INBOX'),
                    toTop('STARRED'),
                    toTop('DRAFT')
                  )
                  .limit(3),
              rowView: 'MenuLabelCitationView',
            }),
            bottomSystemLabelView: this.__ctx__.DAOListView.create({
              dao: this.__ctx__.mgmail.labelDao
                  .where(AND(EQ(GMailLabel.TYPE, 'system'),
                             NEQ(GMailLabel.ID, 'INBOX'),
                             NEQ(GMailLabel.ID, 'STARRED'),
                             NEQ(GMailLabel.ID, 'UNREAD'),
                             NEQ(GMailLabel.ID, 'DRAFT')))
                  .orderBy(toTop('SENT'),
                           toTop('SPAM'),
                           toTop('TRASH')),
              rowView: 'MenuLabelCitationView',
            }),
            userLabelView: this.__ctx__.DAOListView.create({
              dao: this.__ctx__.mgmail.labelDao.where(NEQ(GMailLabel.TYPE, 'system')).orderBy(GMailLabel.NAME),
              rowView: 'MenuLabelCitationView',
            }),
          });
        }
      });
      var self = this;
      this.labelDao.where(EQ(GMailLabel.ID, 'INBOX')).select({
        put: function(inbox) {
          self.changeLabel(inbox);
        }
      });
    },
    openEmail: function(email) {
      email = email.clone();
      var v = this.controller.__ctx__.FloatingView.create({
        view: this.controller.__ctx__.EMailView.create({data: email})
      });
      email.markRead(this.controller.__ctx__);
      this.stack.pushView(v, '');
    },
    changeLabel: function(label) {
      if (label) {
        this.controller.q = 'l:' + label.id;
        this.controller.name = label.name;
      } else {
        this.controller.q = '';
        this.controller.name = 'All Mail';
      }
      this.stack.back();
    },
  },

  actions: [
    {
      model_: 'Action',
      name: 'compose',
      label: '+',
      action: function() {
        var view = this.__ctx__.FloatingView.create({
          view: this.__ctx__.EMailComposeView.create({
            data: this.__ctx__.EMail.create({
              labels: ['DRAFT']
            })
          })
        });
        this.__ctx__.stack.pushView(view, undefined, undefined, 'fromRight');
      }
    }
  ]
});


MODEL({
  name: 'EMailView',
  extendsModel: 'UpdateDetailView',
  properties: [
  ],
  actions: [
    {
      name: 'back',
      isEnabled: function() { return true; },
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      action: function() { this.__ctx__.stack.back(); }
    },
    {
      name: 'moreActions',
      label: '',
      isEnabled: function() { return true; },
      iconUrl: 'icons/ic_more_horiz_white_24dp.png',
      action: function() {
        var actionSheet = this.__ctx__.ActionSheetView.create({
          data: this.data,
          actions: this.data.model_.actions,
        });
        this.__ctx__.stack.slideView(actionSheet);
      },
    },
  ],
  templates: [
    function CSS() {/*
      .actionButtonCView-moreActions {
        margin-right: 10px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-view">
        <div class="header">
          BACK $$back{className: 'backButton'} FORTH
          $$subject{mode: 'read-only', className: 'subject'}
          $$archive{iconUrl: 'icons/ic_archive_white_24dp.png'}
          $$moveToInbox{iconUrl: 'icons/ic_inbox_white_24dp.png'}
          $$trash{iconUrl: 'icons/ic_delete_white_24dp.png'}
          $$moreActions
        </div>
        <div class="content">
          <div style='display: flex'>
            $$from{model_: 'MDMonogramStringView'}
            <div style='flex: 1'>
              $$from{mode: 'read-only', className: 'from', escapeHTML: true}
              <div class='details'>
                $$to{mode: 'read-only'}
                $$cc{mode: 'read-only'}
                <br>
                $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
              </div>
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'actionButton',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
          $$body{ mode: 'read-only', className: 'body', escapeHTML: false }
        </div>
      </div>
    */}
  ]
});


MODEL({
  name: 'EMailCitationView',
  extendsModel: 'DetailView',
  properties: [
    { name: 'className', defaultValue: 'email-citation' },
    {
      name: 'preferredHeight',
      help: 'Specifying the preferred height of this view for the ScrollView, since an empty row is too small.',
      defaultValue: 82
    }
  ],
  templates: [
    function toHTML() {/*
      <%
        var id = this.setClass('unread', function() { return self.data && self.data.unread; }, this.id);
        this.on('click', function() { this.__ctx__.mgmail.openEmail(this.data); }, this.id);
      %>

      <div id="<%= id %>" %%cssClassAttr() >
        $$from{model_: 'MDMonogramStringView'}
        <div style="flex: 1">
          <div style="display: flex">
            $$from{mode: 'read-only', className: 'from', escapeHTML: true}
            $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
          </div>
          <div style="display: flex">
            <div style='flex-grow: 1'>
              $$subject{mode: 'read-only', className: 'subject'}
              $$snippet{mode: 'read-only', className: 'snippet'}
              $$labels{mode: 'read-only', className: 'labels'}
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'star',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
    .email-citation {
      display: flex;
      border-bottom: solid #B5B5B5 1px;
      padding: 10px 14px 10px 6px;
    }

    .email-citation.unread {
      font-weight: bold;
    }

    .email-citation .from {
      display: block;
      font-size: 17px;
      line-height: 24px;
      white-space: nowrap;
      overflow-x:hidden;
      text-overflow: ellipsis;
      flex-grow: 1;
    }

    .email-citation .timestamp {
      font-size: 12px;
      color: rgb(17, 85, 204);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .email-citation .subject {
      display: block;
      font-size: 13px;
      line-height: 17px;
      overflow-x:hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .email-citation .snippet {
      color: rgb(119, 119, 119);
      display: block;
      font-size: 13px;
      height: 20px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .email-citation .monogram-string-view {
      margin: auto 6px auto 0;
    }
    */}
   ]
});


MODEL({
  name: 'MenuView',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait'],
  properties: [
    {
      name: 'topSystemLabelView',
    },
    {
      name: 'bottomSystemLabelView',
    },
    {
      name: 'userLabelView',
    },
    {
      name: 'preferredWidth',
      defaultValue: 200
    }
  ],
  templates: [
    function toInnerHTML() {/*
      <div class="menuView">
        %%topSystemLabelView
        <br>
        <div id="<%= this.on('click', function() { this.__ctx__.mgmail.changeLabel(); }) %>">All Mail</div>
        %%userLabelView
        <br>
        %%bottomSystemLabelView
      </div>
    */},
    function CSS() {/*
      .menuView {
        height: 100%;
        display: block;
        overflow-y: auto;
        background: white;
      }

      .menuView div:hover {
        background-color: #3e50b4;
        color: white;
      }
   */}
  ]
});


MODEL({
  name: 'MenuLabelCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div id="<%= this.on('click', function() { this.__ctx__.mgmail.changeLabel(this.data); }) %>">$$name{mode: 'read-only'}</div>
    */}
   ]
});


var openComposeView = function(email) {
  var X = mgmail.controller.__ctx__;
  var view = X.FloatingView.create({
    view: X.EMailComposeView.create({
      data: email,
    })
  });
  X.stack.pushView(view, undefined, undefined, 'fromRight');
};
