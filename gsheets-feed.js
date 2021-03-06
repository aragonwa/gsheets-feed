
(function( $ ){
  'use strict';
  $.fn.GSFeed = function( options ) {

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
      feedURL      :  '/Globals/feeds/GSSheets',
      cols         : {title: 'headline', link: 'link', text: 'description', date: 'date'},
      numItems     : 4,
      title        : 'News',
      titleIcon    : 'fa-file-text-o',
      tag          : '',
      showSummary  : true
    }, options);

    //Set global scope for instance
    var $this = this,
        allpops = [];
      
    function parseData(data) {
      $this.addClass('news-feed');
      $this.addClass('dated-news-feed');

      var output = '<h2><span class=\"fa-stack\"><i class=\"fa fa-square fa-stack-2x\"></i><i class=\"fa ' + settings.titleIcon + ' fa-stack-1x fa-inverse\"></i> </span> '+ settings.title +'</h2>';

      var feedItems = [];
      if(settings.tag) {
        $.each (data.feed.entry, function(i, item) {
          if(feedItems.length > settings.numItems-1) {
            return false;
          }
          if (item['gsx$tags'].$t === settings.tag){
            var itemObj = {};
            itemObj = {
              date: item['gsx$'+settings.cols.date].$t,
              title: item['gsx$'+settings.cols.title].$t,
              link: item['gsx$'+settings.cols.link].$t,
              text: item['gsx$'+settings.cols.text].$t
            };
            feedItems.push(itemObj);
          }
        });
      } else {
        $.each (data.feed.entry, function(i, item) {
          if(i+1 > settings.numItems) {
            return false;
          }
          var itemObj = {};
          itemObj = {
            date: item['gsx$'+settings.cols.date].$t,
            title: item['gsx$'+settings.cols.title].$t,
            link: item['gsx$'+settings.cols.link].$t,
            text: item['gsx$'+settings.cols.text].$t
          };
          feedItems.push(itemObj);
        });
      }

      feedItems.sort(function(a,b){
        if (new Date(a.date) < new Date(b.date))
          return 1;
        else if (new Date(a.date) > new Date(b.date))
          return -1;
        else
          return 0;
      });

      $.each (feedItems, function(i, item) {
        var date = item.date;

        var title = item.title;

        var link = item.link;

        var text = item.text;

        var dateSplit = date.split('/');

        var month = monthFormat(dateSplit[0]);
        var day = dateSplit[1];

        //Start HTML string
        output += '<div class="media"><div class="media-left">';
        //Print day
        output +='<div class="date-day">'+ day + '</div>';
        //Print month
        output +='<div class="date-month">'+ month + '</div>';
        output += '</div>';
        //Set content for popover
        var popoverContent = 'Summary: '+ text;
        //Get Event name
        output += '<div class="media-body">';
        output +='<a href="'+link+'" id="popover'+i+'" rel="popover" data-animation="true" data-html="true" data-placement="right" data-trigger="hover" data-delay="0" data-content="'+ popoverContent +'" title="'+ title +'">' + title + '</a>';
        if(settings.showSummary) {
          output += '<p>'+text+'</p>';
        }
        //Wrap up
        output+='</div></div>';
        allpops.push('#popover'+i);
      });

      $this.html(output);
      $(allpops).each(function (){
        $(allpops).popover();
      });
    }
    function parseError() {
      $this.addClass('news-feed');
      $this.addClass('dated-news-feed');
      var output = '<h2><span class=\"fa fa-exclamation-triangle fa-color-danger\"></i> </span> Oops...</h2>';
      output += '<div class="media-body">';
      output += '<p>Sorry, this list is temporarily unavailable.</p>';
      output += '<p>Please go <a href="http://www.kingcounty.gov/about/news.aspx">here</a> to see all King County news.</a>';
      output += '</div>';
      $this.html(output);
    }
    //Helper function for Events Calendar function
    function monthFormat(monthToFormat) {
      var month = [];
      month[1] = 'JAN';
      month[2] = 'FEB';
      month[3] = 'MAR';
      month[4] = 'APR';
      month[5] = 'MAY';
      month[6] = 'JUN';
      month[7] = 'JUL';
      month[8] = 'AUG';
      month[9] = 'SEP';
      month[10] = 'OCT';
      month[11] = 'NOV';
      month[12] = 'DEC';
      var formatedMonth = month[monthToFormat];
      return formatedMonth;
    }
    return this.each(function(i) {
      $this.append('<i class="fa fa-spinner fa-spin fa-4x"></i>');

      var dataURL = settings.feedURL;
      var feedDatatype;

      if (dataURL.indexOf('google') >= 0) {
        feedDatatype = 'jsonp';
      } else {
        feedDatatype = 'json';
      }
      //TODO: add a timeout for localstorage: http://apassant.net/2012/01/16/timeout-for-html5-localstorage/
      //Check for session storage otherwise make a pull
      if(sessionStorage && sessionStorage.getItem('gsheetfeedcache'+dataURL)){
        parseData(JSON.parse(sessionStorage.getItem('gsheetfeedcache'+dataURL)));
      } else {
        $.ajax({
          url: dataURL,
          dataType: feedDatatype,
          timeout: 5000,
        })
        .success(function(data) {
          if(sessionStorage){
            sessionStorage.setItem('gsheetfeedcache'+dataURL, JSON.stringify(data));
          }
          parseData(data);
        })
        .error(function(){
          parseError();
        });
      }
    });
  };
})( jQuery );
