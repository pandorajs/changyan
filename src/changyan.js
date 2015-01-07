define(function (require, exports, module) {

    'use strict';

    var $ = require('$'),
        Widget = require('widget');
    require('http://assets.changyan.sohu.com/upload/plugins/plugins.count.js');

    var Changyan = Widget.extend({

        defaults: {
            commentType: false
        },

        setup: function () {
            if (this.option('commentType')) {
                this.initCommentCount();
            } else {
                this.initCommentBox();
            }
        },
        initCommentBox: function () {
            window._config = {
                categoryId: window.article.infoChannel  //接入频道需要填写相应的categoryId
            };

            var appid = 'cyqvqDTV5',
                conf = 'prod_303ed4c69846ab36c2904d3ba8573050';
            var doc = document,
                s = doc.createElement('script'),
                h = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement;
            s.type = 'text/javascript';
            s.charset = 'utf-8';
            s.src = 'http://assets.changyan.sohu.com/upload/changyan.js?conf=' + conf + '&appid=' + appid;
            h.insertBefore(s, h.firstChild);
            window.SCS_NO_IFRAME = true;
        },
        initCommentCount: function () {
            var commentInfo2 = new CommentInfo({commentItem: '.js-comment-item2', commentType: 2, callback: function (data) {
                var comment = data.result;
                for (var i = 0; i < comment.length; i++) {
                    if (comment[i].sum !== 0) {
                        $('[data-topicId=' + i + ']').show();
                    }
                }
            }});
            commentInfo2.init();
        }
    });

    var __CIInterface = {
        '17173': 'http://comment1.news.17173.com/v2/f/comment/topicList.action',
        'changyan': 'https://changyan.sohu.com/api/open/topic/comment/sums?client_id=cyqvqDTV5'
    };

    var CommentInfo = function (opt) {
        this.opts = $.extend({}, {
            debug: false, //开启bug调试
            commentItem: '.js-comment-item', //评论项  容器
            commentCount: '.js-comment-count', //评论数
            commentTitle: '.js-comment-title', //标题
            commentArticleurl: '.js-comment-articleurl', //文章URL
            commentType: 1, //默认1  1:17173评论系统   2：changyan评论系统
            callback: null
        }, opt);
        this.topicIds = null;
        this.opts.debug && console.log('opts=', this.opts);
    };


    CommentInfo.prototype.getData = function (options) {
        var o = this;
        o.opts.debug && console.log('GroupVote.prototype.getData');
        var opts = $.extend({}, {
            topicIds: null,
            callback: function (data) {
                o.opts.debug && console.log('data=', data);
                o.decorate(data);

            },
            url: (o.opts.commentType == 2) ? __CIInterface['changyan'] : __CIInterface['17173']

        }, options);

        if (!opts.topicIds) {
          return;
        }
        var _param = '_random=' + Math.random();
        _param += opts.topicIds;
        $.ajax({
            type: 'get',
            url: opts.url,
            data: _param,
            dataType: 'jsonp',
            success: function (data) {
                if (data && opts.callback) {
                    opts.callback(data);
                    o.opts.callback && o.opts.callback(data);
                }
            }
        });
    };


    CommentInfo.prototype.decorate = function (data) {
        if (!data){
          return;
        }
        var o = this;

        o.opts.debug && console.log('CommentInfo.prototype.decorate');

        if (o.opts.commentType == 2) {//changyan
            var comment = data.result;
            for (var i in comment) {
                var $commentCount = $(o + '[data-topicId=' + i + ']').find(o.opts.commentCount);
                $commentCount.html((comment[i].sum && (comment[i].sum != -1)) ? comment[i].sum : 0);
            }


        } else {//17173

            $.each(data, function (index, dd) {
                var comment = dd;
                //console.log(comment);

                var $commentCount = $(o + '[data-topicId=' + comment.id + ']').find(o.opts.commentCount),
                    $commentTitle = $(o + '[data-topicId=' + comment.id + ']').find(o.opts.commentTitle),
                    $commentArticleurl = $(o + '[data-topicId=' + comment.id + ']').find(o.opts.commentArticleurl);

                $commentCount.html(comment.commentCount);
                $commentTitle.html(comment.title);
                $commentArticleurl.attr('href', comment.articleUrl);

            });
        }
    };

    CommentInfo.prototype.formatTopicIdsParam = function (topicIds) {
        var o = this;
        var urlParam = '';
        for (var i in topicIds) {
            if (topicIds.hasOwnProperty(i)) {
                if (o.opts.commentType == 2) {//changyan
                    i === 0 ? urlParam += '&topic_source_id=' + topicIds[i] : urlParam += ',' + topicIds[i];
                } else {//17173
                    urlParam += '&topicIds=' + encodeURIComponent(topicIds[i]);
                }
            }


        }
        return urlParam;
    };

    CommentInfo.prototype.init = function () {
        var o = this;
        o.opts.debug && console.log('CommentInfo.prototype.init');


        var _topicIds = [];
        $(o.opts.commentItem).each(function (index, element) {

            var self = $(this);
            if (self.length <= 0) {
              return;
            }

            try {
                var topicId = self.attr('data-topicId');
                _topicIds.push(topicId);
            }
            catch (exception) {
            }
        });

        if (!_topicIds && _topicIds.length <= 0) {
          return;
        }
        o.topicIds = o.formatTopicIdsParam(_topicIds);

        o.getData({
            topicIds: o.topicIds
        });

    };
    module.exports = Changyan;

});
