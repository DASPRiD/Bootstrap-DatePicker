(function($){
    'use strict';

    function isNativeCalendarAvailable(){
        if (isNativeCalendarAvailable.available !== undefined) {
            return isNativeCalendarAvailable.available;
        }

        var userAgent = window.navigator.userAgent;
        var element = document.createElement('input');
        element.type = 'date';

        isNativeCalendarAvailable.available = (
            (
                userAgent.match(/Android/i)
                || userAgent.match(/webOS/i)
                || userAgent.match(/iPhone/i)
                || userAgent.match(/iPad/i)
                || userAgent.match(/iPod/i)
                || userAgent.match(/BlackBerry/i)
                || userAgent.match(/Windows Phone/i)
            )
            && element.type === 'date'
        );

        return isNativeCalendarAvailable.available;
    }

    var DatePicker = function(element, options){
        this.options = $.extend({}, this.defaults, options);
        this.originalInput = $(element);

        if (this.options.preferNativeCalendar) {
            this.useNativeCalendar = isNativeCalendarAvailable();
        } else {
            this.useNativeCalendar = false;
        }

        this.initDatePicker();
    };

    DatePicker.prototype = {
        constructor: DatePicker,

        defaults: {
            defaultToday: false,
            dateFormat: 'L',
            preferNativeCalendar: true
        },

        initDatePicker: function(){
            var datePicker = this;

            if (this.useNativeCalendar) {
                this.originalInput.attr('type', 'date');
                this.group = $('<div class="input-group bootstrap-datepicker"/>');
                this.originalInput.after(this.group);
                this.group.append('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"/></span>');
                this.group.append(this.originalInput);
                this.group.append('<span class="input-group-btn"><button class="btn btn-default" type="button"><span class="glyphicon glyphicon-remove"/></button></span>');

                if (this.originalInput.val() === '' && this.options.defaultToday) {
                    this.originalInput.val(moment().format('YYYY-MM-DD'));
                }

                this.group.find('button').on('click', function(){
                    datePicker.originalInput.val('');
                });
                return;
            }

            this.input = this.originalInput.clone();

            this.originalInput.removeAttr('required');
            this.originalInput.hide();
            this.input.removeAttr('name');
            this.input.attr('readonly', 'readonly');
            this.input.val('');

            this.group = $('<div class="input-group bootstrap-datepicker"/>');
            this.originalInput.after(this.group);
            this.group.append('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"/></span>');
            this.group.append(this.input);
            this.group.append('<span class="input-group-btn"><button class="btn btn-default" type="button"><span class="glyphicon glyphicon-remove"/></button></span>');

            this.date = null;

            if (this.originalInput.val() !== '') {
                this.date = moment(this.originalInput.val(), 'YYYY-MM-DD');

                if (!this.date.isValid()) {
                    this.date = null;
                }
            } else if (this.options.defaultToday) {
                this.date = moment();
            } else {
                this.date = null;
            }

            this.updateInputs();
            this.calendar = null;

            this.input.on('click', function(){
                datePicker.initCalendar.call(datePicker);
            });

            this.group.find('button').on('click', function(){
                datePicker.unsetValue.call(datePicker);
            });
        },

        initCalendar: function(){
            if (this.input.is('.disabled') || this.input.attr('disabled') || this.calendar !== null) {
                return;
            }

            this.calendar = $(
                '<div class="bootstrap-datepicker-calendar">' +
                '    <table class="table table-bordered">' +
                '       <thead>' +
                '           <tr class="months">' +
                '               <th colspan="4" class="month">' +
                '                   <a class="previous" href="#"><i class="glyphicon glyphicon-chevron-left"></i></a>' +
                '                   <span/>' +
                '                   <a class="next" href="#"><i class="glyphicon glyphicon-chevron-right"></i></a>' +
                '               </th>' +
                '               <th colspan="3" class="year">' +
                '                   <a class="previous" href="#"><i class="glyphicon glyphicon-chevron-left"></i></a>' +
                '                   <span/>' +
                '                   <a class="next" href="#"><i class="glyphicon glyphicon-chevron-right"></i></a>' +
                '               </th>' +
                '           </tr>' +
                '           <tr class="weekdays"/>' +
                '       </thead>' +
                '       <tbody/>' +
                '    </table>' +
                '</div>'
            );

            var weekdays = this.calendar.find('table > thead > tr.weekdays');
            var weekdate = moment();

            for (var weekday = 0; weekday < 7; weekday++) {
                weekdate.weekday(weekday);
                weekdays.append($('<th>').text(weekdate.format('ddd')));
            }

            this.group.append(this.calendar);
            var datePicker = this;

            var date = this.date === null ? moment() : moment(this.date);
            date.day(1);

            this.calendar.data('date', date);
            this.updateCalendar();

            this.calendar.find('table > thead > tr > th.month > a.previous').on('click', function(){
                date.month(date.month() - 1);
                datePicker.updateCalendar.call(datePicker);
            });

            this.calendar.find('table > thead > tr > th.month > a.next').on('click', function(){
                date.month(date.month() + 1);
                datePicker.updateCalendar.call(datePicker);
            });

            this.calendar.find('table > thead > tr > th.year > a.previous').on('click', function(){
                date.year(date.year() - 1);
                datePicker.updateCalendar.call(datePicker);
            });

            this.calendar.find('table > thead > tr > th.year > a.next').on('click', function(){
                date.year(date.year() + 1);
                datePicker.updateCalendar.call(datePicker);
            });

            this.calendar.find('table > tbody').on('click', 'td:not(.off)', function(){
                datePicker.selectValue.call(datePicker, $(this).data('day'));
            });

            this.closeHandler = function(event){
                if (!$(event.target).closest('.bootstrap-datepicker').is(datePicker.group)) {
                    datePicker.destroyCalendar.call(datePicker);
                    $(document).off('click.bootstrap-datepicker', null, datePicker.closeHandler);
                }
            };

            $(document).on('click.bootstrap-datepicker', this.closeHandler);
        },

        selectValue: function(day){
            this.date = this.calendar.data('date');
            this.date.date(day);
            this.updateInputs();
            this.destroyCalendar();
        },

        unsetValue: function(){
            this.date = null;
            this.updateInputs();
            this.destroyCalendar();
        },

        updateCalendar: function(){
            var date = this.calendar.data('date');

            this.calendar.find('table > thead > tr > th.month > span').text(date.format('MMMM'));
            this.calendar.find('table > thead > tr > th.year > span').text(date.format('YYYY'));

            var days = this.calendar.find('table > tbody').html('');

            var numDaysCurrentMonth  = date.month(date.month() + 1).date(0).date();
            var lastWeekday          = date.weekday();
            var numDaysPreviousMonth = date.date(0).date();
            var firstWeekday         = date.date(date.date() + 1).weekday();

            var day, weekday, row = '';

            for (weekday = 0; weekday < firstWeekday; weekday++) {
                row += '<td class="off">' + (numDaysPreviousMonth - (firstWeekday - weekday - 1)) + '</td>';
            }

            var today = moment();

            for (day = 1; day <= numDaysCurrentMonth; day++) {
                if (today.year() === date.year() && today.month() === date.month() && today.date() === day) {
                    row += '<td class="today" data-day="' + day + '">' + day + '</td>';
                } else {
                    row += '<td data-day="' + day + '">' + day + '</td>';
                }

                if (++weekday === 7) {
                    weekday = 0;
                    days.append('<tr>' + row + '</tr>');
                    row = '';
                }
            }

            if (weekday > 0) {
                for (day = 1; weekday < 7; weekday++, day++) {
                    row += '<td class="off">' + day + '</td>';
                }
                days.append('<tr>' + row + '</tr>');
            }
        },

        destroyCalendar: function(){
            if (this.calendar === null) {
                return;
            }

            this.calendar.remove();
            this.calendar = null;
            this.closeHandler = null;
        },

        getDate: function(){
            return this.date === null ? null : moment(this.date);
        },

        setDate: function(date){
            this.date = !date ? null : moment(date);

            if (!this.date.isValid()) {
                this.date = null;
            }

            this.updateInputs();
        },

        updateInputs: function(){
            if (this.date === null) {
                this.originalInput.val('');
                this.input.val('');
                return;
            }

            this.originalInput.val(this.date.format('YYYY-MM-DD'));
            this.input.val(this.date.format(this.options.dateFormat));
        }
    };

    $.fn.bootstrapDatePicker = function(option) {
        this.each(function(){
            var $this   = $(this);
            var options = typeof(option) === 'object' && option;

            if (!$this.data('datepicker')) {
                $this.data('datepicker', new DatePicker(this, options));
            }
        });

        if (typeof option !== 'string') {
            return this;
        }

        if (option === 'getDate') {
            return this.data('datepicker')['getDate'].call(this.data('datepicker'));
        }

        if (option === 'setDate') {
            return this.data('datepicker')['setDate'].call(this.data('datepicker'), arguments[1]);
        }
    };
}(jQuery));
