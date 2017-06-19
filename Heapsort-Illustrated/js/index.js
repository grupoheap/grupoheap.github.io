/**
 * Classy - classy classes for JavaScript
 *
 * :copyright: (c) 2011 by Armin Ronacher.
 * :license: BSD.
 */

;(function(undefined) {
  var
    CLASSY_VERSION = '1.4',
    root = this,
    old_class = root.Class,
    disable_constructor = false;

  /* we check if $super is in use by a class if we can.  But first we have to
     check if the JavaScript interpreter supports that.  This also matches
     to false positives later, but that does not do any harm besides slightly
     slowing calls down. */
  var probe_super = (function(){$super();}).toString().indexOf('$super') > 0;
  function usesSuper(obj) {
    return !probe_super || /\B\$super\b/.test(obj.toString());
  }

  /* helper function to set the attribute of something to a value or
     removes it if the value is undefined. */
  function setOrUnset(obj, key, value) {
    if (value === undefined)
      delete obj[key];
    else
      obj[key] = value;
  }

  /* gets the own property of an object */
  function getOwnProperty(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name)
      ? obj[name] : undefined;
  }

  /* instanciate a class without calling the constructor */
  function cheapNew(cls) {
    disable_constructor = true;
    var rv = new cls;
    disable_constructor = false;
    return rv;
  }

  /* the base class we export */
  var Class = function() {};

  /* restore the global Class name and pass it to a function.  This allows
     different versions of the classy library to be used side by side and
     in combination with other libraries. */
  Class.$noConflict = function() {
    try {
      setOrUnset(root, 'Class', old_class);
    }
    catch (e) {
      // fix for IE that does not support delete on window
      root.Class = old_class;
    }
    return Class;
  };

  /* what version of classy are we using? */
  Class.$classyVersion = CLASSY_VERSION;

  /* extend functionality */
  Class.$extend = function(properties) {
    var super_prototype = this.prototype;

    /* disable constructors and instanciate prototype.  Because the
       prototype can't raise an exception when created, we are safe
       without a try/finally here. */
    var prototype = cheapNew(this);

    /* copy all properties of the includes over if there are any */
    if (properties.__include__)
      for (var i = 0, n = properties.__include__.length; i != n; ++i) {
        var mixin = properties.__include__[i];
        for (var name in mixin) {
          var value = getOwnProperty(mixin, name);
          if (value !== undefined)
            prototype[name] = mixin[name];
        }
      }

    /* copy class vars from the superclass */
    properties.__classvars__ = properties.__classvars__ || {};
    if (prototype.__classvars__)
      for (var key in prototype.__classvars__)
        if (!properties.__classvars__[key]) {
          var value = getOwnProperty(prototype.__classvars__, key);
          properties.__classvars__[key] = value;
        }

    /* copy all properties over to the new prototype */
    for (var name in properties) {
      var value = getOwnProperty(properties, name);
      if (name === '__include__' ||
          value === undefined)
        continue;

      prototype[name] = typeof value === 'function' && usesSuper(value) ?
        (function(meth, name) {
          return function() {
            var old_super = getOwnProperty(this, '$super');
            this.$super = super_prototype[name];
            try {
              return meth.apply(this, arguments);
            }
            finally {
              setOrUnset(this, '$super', old_super);
            }
          };
        })(value, name) : value
    }

    /* dummy constructor */
    var rv = function() {
      if (disable_constructor)
        return;
      var proper_this = root === this ? cheapNew(arguments.callee) : this;
      if (proper_this.__init__)
        proper_this.__init__.apply(proper_this, arguments);
      proper_this.$class = rv;
      return proper_this;
    }

    /* copy all class vars over of any */
    for (var key in properties.__classvars__) {
      var value = getOwnProperty(properties.__classvars__, key);
      if (value !== undefined)
        rv[key] = value;
    }

    /* copy prototype and constructor over, reattach $extend and
       return the class */
    rv.prototype = prototype;
    rv.constructor = rv;
    rv.$extend = Class.$extend;
    rv.$withData = Class.$withData;
    return rv;
  };

  /* instanciate with data functionality */
  Class.$withData = function(data) {
    var rv = cheapNew(this);
    for (var key in data) {
      var value = getOwnProperty(data, key);
      if (value !== undefined)
        rv[key] = value;
    }
    return rv;
  };

  /* export the class */
  root.Class = Class;
})();


(function(){
var PROFILE = false
//var PROFILE = true

// -----------------------------------------
// Utils
// -----------------------------------------
jQuery.fn.swap = function(b){
    b = jQuery(b)[0];
    var a = this[0];
    var temp = a.parentNode.insertBefore(document.createTextNode(''), a);
    b.parentNode.insertBefore(a, b);
    temp.parentNode.insertBefore(b, temp);
    temp.parentNode.removeChild(temp);
    return this;
}

Array.prototype.insert = function(value, index){
  var array = this
    for(var i = array.length - 1; index <= i; i--){
        array[i + 1] = array[i]
    }
    array[index] = value
}

Array.prototype.insertBefore = function(from, to){
  this.insert(this[from], to)
  if(to < from){
    from += 1
  }
  this.splice(from, 1)
}
Array.prototype.swap = function(a, b){
  var temp = this[a]
  this[a] = this[b]
  this[b] = temp
}

function range(min, max){
  var array = []
  while(min < max){
    array.push(min)
    min++
  }
  return array
}

function randrange(min, max){
  return Math.floor(Math.random() * (max - min)) + min
}

function shuffle(array){
  var length = array.length
  for(var i = 0; i < length; i++){
    var j = randrange(0, length)
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

window.profile = {
  nowProfiling: false,
  start: function(name){
    if(PROFILE === false) return
    if(this.nowProfiling){
      console.profileEnd()
    }
    this.nowProfiling = true
    console.profile(name)
  },
  end: function(){
    if(PROFILE === false) return
    this.nowProfiling = false
    console.profileEnd()
  }
}

// -----------------------------------------
// Queue class
// -----------------------------------------
var Queue = Class.$extend({
  __init__: function(){
    this.length = 0
    this.i = 0
    this.queue = []
  },

  get: function(){
    if(this.length === 0)
      return undefined
    this.length--
    return this.queue[this.i++]
  },

  put: function(value){
    this.queue.push(value)
    this.length++
  }
})

// -----------------------------------------
// Controller class
// -----------------------------------------
Controller = Class.$extend({
  widget: $("<span class='widget'></span>"),
  reset: $.noop,
  onSpeedChange: $.noop,
  onLengthChange: $.noop,

  __init__: function(defaults){
    this.element = $("<div class='controller'>")
    var restart = this._createRestartButton()
    var buttonset = this._createLengthButtonSet(defaults.length)
    var slider = this._createSpeedSlider(defaults.speed)
    this.element.append(restart).append(buttonset).append(slider)
  },


  _createRestartButton: function(){
    var self = this
    var button = $("<button>Restart</button>").button().click(function(){
      self.restart()
    })
    return this.widget.clone().append(button)
  },

  _createSpeedSlider: function(defaultSpeed){
    var self = this
    var amount = $("<span class='speed-amount'></span>").text(defaultSpeed)
    var slider = $("<span class='speed-slider'></span>")
    slider.slider({
      min: 1,
      max: 100,
      value: defaultSpeed,
      slide: function(event, ui){
        amount.text(ui.value)
        self.onSpeedChange(ui.value)
      }
    })

    var sliderWrapper = $("<span>").append(amount).append(slider)
    return this.widget.clone().text("Speed: ").append(sliderWrapper)
  },

  _createLengthButtonSet: function(defaultLength){
    var self = this
    var buttonset = this.widget.clone().addClass("length-button")
    var radioName = "graphical-sort-radio"
    var _label = $("<label>")
    var _radio = $("<input type='radio'>").attr("name", radioName)
    $.each([5, 10, 30, 50, 100, 200], function(i, length){
      var label = _label.clone().text(length).attr("for", radioName + length)
      var radio = _radio.clone().attr("id", radioName + length).val(length)
      buttonset.append(label).append(radio)
    })
    buttonset.find("input[value=" + defaultLength + "]").attr("checked", "checked")
    buttonset.buttonset()
    buttonset.click(function(event, ui){
      self.onLengthChange(parseInt(event.target.value))
    })
    return buttonset
  }
})
// -----------------------------------------
// Bar class
// -----------------------------------------
var Bar = Class.$extend({
  __init__: function(value){
    this.value = value
  },
  createElement: function(){
    var bar = $("<span>")
    return bar
  }
})

// -----------------------------------------
// Bars class
// -----------------------------------------
var Bars = Class.$extend({
  __init__: function(length, container){
    this.length = length
    this.container = container
    this.bars = []
    var values = this.values = shuffle(range(1, length+1))

    for(var i = 0; i < length; i++){
      this.bars[i] = Bar(values[i])
    }
    this.elements = this._createElements()
  },

  swap: function(a, b, command){
    var className = "highlight"
    var elements = this.container.find("span")
    elements.removeClass(className)
    var barA = elements.eq(a)
    var barB = elements.eq(b)
    barA[0].className = barB[0].className = className
    if(command === C.swap){
      barB.swap(barA)
    }
  },

  insert: function(from, to){
    var elements = this.container.find("span").removeClass("highlight")
    this.container[0].insertBefore(elements.eq(from).addClass("highlight")[0], elements[to])
  },

  _createElements: function(){
    var elements = $()
    var length = this.length
    $.each(this.bars, function(){
      var bar = this
      var element = bar.createElement()
      element.css("width", 100 / length + "%")
      element.css("height", bar.value / length * 100 + "%")
      elements = elements.add(element)
    })
    return elements
  }
})

var Command = Class.$extend({
  __classvars__: {
    highlight: "highlight",
    swap: "swap",
    insert: "insert",
    set: "set"
  }
})
var C = Command

// -----------------------------------------
// GraphicalSort class
// -----------------------------------------
GraphicalSort = Class.$extend({
  length: 30,  // default list length
  speed: 100,  // default speed
  currentTaskId: -1,

  __init__: function(){},

  // graphical API
  compare: function(a, b){
    var command = C.highlight
    if(this.values[a] > this.values[b]){
      this.values.swap(a, b)
      command = C.swap
    }
    this.task.put([a, b, command])
  },

  // graphical API
  highlight: function(a, b){
    this.task.put([a, b, C.highlight])
  },

  // graphical API
  swap: function(a, b){
    this.values.swap( a, b)
    this.task.put([a, b, C.swap])
  },

  // graphical API
  insertBefore: function(from, to){
    this.values.insertBefore(from, to)
    this.task.put([from, to, C.insert])
  },

  show: function(viewElement){
    if(this.sortFunc === undefined){
      throw Error("sort function is undefined")
    }
    this.$sort = $("<div class='graphical-sort'>")
    this.$sort.append(this._createController().element)
    this.container = $("<div class='bars-container'>")
    this.$sort.append(this.container)

    viewElement.append(this.$sort)
    this.displayBars()
  },

  displayBars: function(){
    clearTimeout(this.currentTaskId)
    this.bars = Bars(this.length, this.container)
    this.values = this.bars.values
    this.container.empty().append(this.bars.elements)
    this._initTask()

    profile.start()
    this._setTimeout()
  },

  complete: function(){
    this.container.find("span").removeClass("highlight")
    if(this.sortFunc.name === "bogoSort"){
      if(this.bogoSortCompleted === false){
        this._initTask()
        this._setTimeout()
        return
      }
    }
    profile.end()
  },

  _createController: function(){
    this.controller = Controller({
      speed: this.speed,
      length: this.length
    })
    return this._setEventToController(this.controller)
  },

  _setEventToController: function(controller){
    var self = this
    controller.onLengthChange = function(length){
      self.length = length
      self.displayBars()
    }
    controller.onSpeedChange = function(speed){
      self.speed = speed
    }
    controller.restart = function(){
      self.displayBars()
    }
    return controller
  },

  _initTask: function(){
    this.task = Queue()
    this.sortFunc()
  },

  _next: function(){
    var order = this.task.get()
    if(order === undefined){
      this.complete()
      return
    }
    var command = order[2]
    if(command === C.insert){
      this.bars.insert(order[0], order[1])
    }else{
      this.bars.swap(order[0], order[1], command)
    }

    this._setTimeout()

  },

  _setTimeout: function(){
    var self = this
    var interval = 2000 / this.speed
    this.currentTaskId = setTimeout(function(){
      self._next()
    }, interval)
  }
})

})();


$(function(){
  // -----------------------------------------
  // Bubble sort
  // -----------------------------------------
  function bubbleSort(){
    var array = this.values
    var length = array.length
    for(var i = length - 1; 0 < i; i--){
      for(var j = 0; j < i; j++){
        this.compare(j, j + 1)
      }
    }
  }

  // -----------------------------------------
  // Selection sort
  // -----------------------------------------
  function selectionSort(){
    var array = this.values
    var length = array.length
    for(var i = 0; i < length - 1; i++){
      var minIndex = i
      var minValue = array[minIndex]
      for (var j = i + 1; j < length; j++) {
        this.highlight(j, minIndex)
        if (array[j] < minValue) {
          minIndex = j
          minValue = array[minIndex]
        }
      }
      this.compare(i, minIndex)
    }
    return array
  }
  // -----------------------------------------
  // Shaker Sort
  // -----------------------------------------
  function shakerSort(){
    var array = this.values
    var length = array.length
    var left = 0
    var right = length - 1
    var lastSwappedLeft = left
    var lastSwappedRight = right

    while(left < right){
      lastSwappedRight = 0
      for(var i = left; i < right; i++){
        if(array[i] > array[i + 1]){
          this.swap(i, i + 1)
          lastSwappedRight = i
        }else{
          this.highlight(i, i + 1)
        }
      }
      right = lastSwappedRight

      lastSwappedLeft = length - 1
      for(var j = right; left < j; j--){
        if(array[j - 1] > array[j]){
          this.swap(j - 1, j)
          lastSwappedLeft = j
        }else{
          this.highlight(j - 1, j)
        }
      }
      left = lastSwappedLeft
    }
  }
  // -----------------------------------------
  // Insertion sort
  // -----------------------------------------
  function insertionSort(){
    var array = this.values
    var length = array.length
    for(var i = 1; i < length; i++){
      for(var j = i; 0 < j; j--){
        if(array[j - 1] > array[j]){
          this.swap(j - 1, j)
        }else{
          this.highlight(j - 1, j)
          break
        }
      }
    }
  }

  // -----------------------------------------
  // Shell Sort
  // -----------------------------------------
  function shellSort(){
    var array = this.values
    var length = array.length
    var gap = 1
    while(gap < length) {
      gap = 3 * gap + 1
    }
    while(gap > 1){
      gap = Math.floor(gap / 3)
      for(var i = gap; i < length; i++){
        for(var j = i; 0 < j; j -= gap){
          if(array[j - gap] > array[j]){
            this.swap(j - gap, j)
          }else{
            this.highlight(j - gap, j)
            break
          }
        }
      }
    }
  }

  // -----------------------------------------
  // Quick sort
  // -----------------------------------------
  function quickSort(first, last){
    // TODO: あとで書き直す
    var array = this.values
    first = (first === undefined) ? 0 : first
    last = (last === undefined) ? (array.length - 1) : last

    var pivotIndex = Math.floor((first + last) / 2)
    var pivotValue = array[pivotIndex]
    var f = first, l = last
    while(true){
      while(true){
        this.highlight(f, pivotIndex)
        if(!(array[f] < pivotValue)) break
        f++
      }
      while(true){
        this.highlight(l, pivotIndex)
        if(!(pivotValue < array[l])) break
        l--
      }
      if(l <= f){
        break
      }
      if(pivotIndex === l){
        pivotIndex = f
      }
      if(pivotIndex === l){
        pivotIndex = l
      }
      this.compare(f, l)
      f++; l--
    }
    if(first < f - 1) quickSort.call(this, first, f - 1)
    if(l + 1 < last) quickSort.call(this, l + 1, last)
  }

  // -----------------------------------------
  // Merge sort
  // -----------------------------------------
  function mergeSort(first, last){
    var array = this.values
    first = (first === undefined) ? 0 : first
    last = (last === undefined) ? array.length - 1 : last
    if (last - first < 1) {
      return
    }
    var middle = Math.floor((first + last) / 2)
    mergeSort.call(this, first, middle)
    mergeSort.call(this, middle + 1, last)

    var f = first
    var m = middle

    while (f <= m && m + 1 <= last) {
      this.highlight(f, m + 1)
      if (array[f] >= array[m + 1]) {
        this.insertBefore(m + 1, f)
        m++
      }
      f++
    }
  }

  // -----------------------------------------
  // Heap sort
  // -----------------------------------------
  function swapUp(array, current){
    var parent = Math.floor((current - 1) / 2)
    while(current != 0){
      if (!(array[current] > array[parent])) {
        this.highlight(current, parent)
        break
      }
      this.swap(current, parent)
      current = parent
      parent = Math.floor((current - 1) / 2)
    }
  }

  function swapDown(array, current, length){
    var child = current * 2 + 1
    while(true){
      if(array[child] < array[child + 1]){
        child += 1
      }
      if(array[current] >= array[child]){
        this.highlight(current, child)
        break
      }
      if(length <= child){
        break
      }
      this.swap(current, child)
      current = child
      child = current * 2 + 1
    }
  }

  function heapify(array){
    for(var i = 0; i < array.length; i++){
      swapUp.call(this, array, i)
    }
  }

  function heapSort(){
    var array = this.values
    heapify.call(this, array)
    for(var i = array.length - 1; 0 < i; i--){
      if(array[0] > array[i]){
        this.swap(0, i)
      }else{
        this.highlight(0, i)
      }
      swapDown.call(this, array, 0, i)
    }
  }

  // -----------------------------------------
  // Bogo sort
  // -----------------------------------------
  function bogoSort(){
    var array = this.values
    this.bogoSortCompleted = false
    var length = array.length
    // shffle
    for(var i = 0; i < length; i++){
      var j = Math.floor(Math.random() * length)
      this.swap(i, j)
    }

    // check
    for(var i = 0; i < length - 1; i++){
      this.highlight(i, i + 1)
      if(array[i] > array[i + 1]){
        return　// incomplete
      }
    }
    this.bogoSortCompleted = true
  }
  bogoSort.name = "bogoSort"

  // -----------------------------------------
  // Main
  // -----------------------------------------
  var sort = GraphicalSort()

  // default sort function
  sort.sortFunc = heapSort

  var view = $("#view")
  view.width($(window).width()).height($(window).height() - 125)
  sort.show(view)

  // -----------------------------------------
  // Sort menu
  // -----------------------------------------
  /*var sortMenu = {
   "Bubble": bubbleSort,
    "Selection": selectionSort,
    "Shaker": shakerSort,
    "Insertion": insertionSort,
    "Shell": shellSort,
    "Quick": quickSort,
    "Merge": mergeSort,
    "Heap": heapSort,
    "Bogo": bogoSort
  }*/

  var menu = $("<div>").insertBefore(view).css({
    height: 65,
    margin: "10px 0px",
    fontSize: 12
  })
  $.each(sortMenu, function(name, func){
    var radio = $("<input type='radio' name='sort-menu' >").attr("id", name).appendTo(menu)
    var label = $("<label>").attr("for", name).text(name).appendTo(menu)

    radio.click(function(){
      sort.sortFunc = func
      sort.displayBars()
    })

    if(sort.sortFunc === func){
      radio.attr("checked", "true")
    }
  })
  menu.buttonset()
})
