## 简单实现vue的数据双向绑定

#### 简介

>这是一个根据vue源码，实现的简单的vue数据双向绑定，旨在深入理解vue双向数据绑定原理。

#### 介绍

有三个例子，复杂度依次增大。

第一个例子是最简单粗暴的实现数据双向绑定，主要涉及到的是input事件和Object.defineProperty(),核心代码如下：
```
// html
<input type="text" name="mvvm" id="mvvm-input" oninput="mvvm(event)">
<span id="mvvm-show"></span>

// js
var data = {};
Object.defineProperty(data, 'model', {
  get: function() {
    return 'simple mvvm';
  },
  set: function(newvalue) {
    document.getElementById('mvvm-input').value = newvalue;
    document.getElementById('mvvm-show').innerHTML = newvalue;
  }
})

function mvvm(e) {
  data.model = e.target.value;
}
```

第二个例子是以vue源码实现的简化版的数据双向绑定，涉及观察者模式、Object.defineProperty()及Document.createDocumentFragment()，核心代码如下：
```
// html
<div id="app">
    <input type="text" v-model="text01">
    {{ text01 }}
  </div>
  <script type="text/javascript">
    new Vue({
      el: 'app',
      data: {
        text01: 'defineProperty mvvm!!!'
      }
    })
  </script>

// js
// Vue function
function Vue(options) {
  this.data = options.data;

  let data = this.data;
  observe(data);

  let id = options.el;
  let dom = nodeToFragment(document.getElementById(id), this);
  document.getElementById(id).appendChild(dom);

}

// observe
function observe(obj) {
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key]);
  })
}

function defineReactive(obj, key, val) {
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get: function() {
      if (Dep.target) {
        dep.addSub(Dep.target)
      }

      return val;
    },
    set: function(newvalue) {
      if(newvalue === val) {
        return
      }
      val = newvalue;
      dep.notify();
    }
  });
}

// Watch and Dep
function Watcher (vm, node, name, nodeType) {
  Dep.target = this;
  this.name = name;
  this.node = node;
  this.vm = vm;
  this.nodeType = nodeType;
  this.update();
  Dep.target = null;
}

Watcher.prototype = {
  update: function () {
    this.get();
    if (this.nodeType == 'text') {
      this.node.nodeValue = this.value;
    }
    if (this.nodeType == 'input') {
      this.node.value = this.value;
    }
  },
  get: function () {
    this.value = this.vm.data[this.name];
  }
}

function Dep () {
  this.subs = []
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },
  notify: function() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}

```

第三个例子与第二个例子主要的差别是用ES6 Proxy替换了Object.defineProperty()，其他部分都一样，涉及Proxy的代码如下：
```
function observe(obj, vm) {
  vm.data = proxyReactive(obj);
}

function proxyReactive(obj) {
  let dep = new Dep();
  let proxy = new Proxy(obj, {
    get: function (target, prop) {
      if (prop in target) {
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        return target[prop];
      } else {
        throw new ReferenceError("prop \"" + prop + "\" does not exist.");
      }
    },
    set: function (target, prop, newvalue) {
      if (!Number.isInteger(newvalue)) {
        throw new TypeError(`The ${prop} is not an integer`);
      }
      if (newvalue > 200) {
        throw new RangeError(`The ${prop} seems invalid`);
      }
      target[prop] = newvalue;
      dep.notify();
    }
  })
  return proxy
}
```

#### 后记

经过一番努力，花了两个晚上的时间，实现了简化版vue数据双向绑定，从中也学到了很多东西，同时也加深了对以前些知识点理解。

一句话，收获颇多，继续努力，下一篇研究vue-router的实现，敬请期待

#### 参考资料
[Javascript中理解发布--订阅模式](https://www.cnblogs.com/tugenhua0707/p/4687947.html)

[Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
 
[ES6 Proxy](http://es6.ruanyifeng.com/#docs/proxy)
[ES6 Proxy在vue源码中的使用](http://es6.ruanyifeng.com/#docs/proxy)

[Document.createDocumentFragment()](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment)
