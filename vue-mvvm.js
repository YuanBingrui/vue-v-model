function Vue(options) {
  this.data = options.data;

  let data = this.data;
  observe(data);

  let id = options.el;
  let dom = nodeToFragment(document.getElementById(id), this);
  document.getElementById(id).appendChild(dom);

}

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

function nodeToFragment(node, vm) {
  let flag = document.createDocumentFragment();
  let child;

  while (child = node.firstChild) {
    compile(child, vm);
    flag.appendChild(child);
  }

  return flag;
}

function compile(node, vm) {
  let reg = /\{\{(.*)\}\}/;
  // 节点类型为元素
  if (node.nodeType === 1) {
    let attr = node.attributes;
    // 解析属性
    for (let i = 0; i < attr.length; i++) {
      if (attr[i].nodeName === 'v-model') {
        let name = attr[i].nodeValue;
        node.addEventListener('input', (e) => {
          vm.data[name] = e.target.value;
        })
        node.removeAttribute('v-model');
        new Watcher(vm, node, name, 'input');
      }
    }
  }
  // 节点类型为text
  if (node.nodeType === 3) {
    if (reg.test(node.nodeValue)) {
      let name = RegExp.$1;
      name = name.trim();
      node.nodeValue = vm.data[name];
      new Watcher(vm, node, name, 'text');
    }
  }
}

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
