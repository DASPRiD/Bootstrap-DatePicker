# Bootstrap Datepicker

I looked around a lot to find some nice datepicker for bootstrap, but the major
problem was that they were either lacking crucial features or simply not
maintained anymore with a lot of open issues. Thus I decided to just roll my
own one. To keep the datepicker as simple as possible, it's using Moment.js
for handling all the date-specific stuff and the i18n.

The most important feature about this datepicker is that all values transfered
to your backend and coming from it are always formatted as ISO dates, so you
don't have to do any complicated parsing on your server.

## Demo

A demo is available on the GitHub pages of this project:

http://dasprid.github.io/Bootstrap-DatePicker/demo.html

## Installation and usage

First, grab the latest version of Moment.js from here:
http://momentjs.com/

If you only need support for the English locale, you are fine with the smaller
moment.min.js file, else go with moment-with-lang.min.js. Right now you cannot
change the locale of the datepicker locally, so just change the locale of
Moment.js globally:

```js
moment.lang('de')
```

Next, just load up bootstrap-datepicker.css and bootstrap-datepicker.js. The
final step is to initialize it. All you need to do is set up your input, for
instance:

```html
<input type="text" class="form-control datepicker" value="2014-01-01"/>
```

Then you can just let the jQuery plugin roll over it:

```js
$('input.datepicker').bootstrapDatePicker();
```

You can also pass a few options to the initializer:

- defaultToday (bool, ```false```): whether the input should default to today
  when the value is empty.
- dateFormat (string, ```L```): date format displayed in the input field to the
  user. See http://momentjs.com/docs/#/displaying/format/

Instead of passing these values into the initializer, you can also plant them
onto the input:

```html
<input type="text" class="form-control datepicker" data-default-today="true" data-date-format="YY/MM/DD"/>
```

```js
$('input.datepicker').each(function(){
    var datepicker = $(this);
    datepicker.bootstrapDatePicker(datepicker.data());
});
```

Last but not least, you are also able to get and set the date of the datepicker
via API calls. The setter will expect either a ```Moment``` object or
```null```, but you can also pass in a string and Moment.js will try to parse
it. The getter will always return either a ```Moment``` object or ```null```.

```js
var date = $('#some-datepicker-input').bootstrapDatePicker('getDate');
$('#some-datepicker-input').bootstrapDatePicker('setDate', date);
```

