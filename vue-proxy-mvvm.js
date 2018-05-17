function Vue(options) {
  this.data = options.data;
  console.log(this, this.data);

  let data = JSON.parse(JSON.stringify(this.data));
  observe(data, this);

  let id = options.el;
  let dom = nodeToFragment(document.getElementById(id), this);
  document.getElementById(id).appendChild(dom);

}

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
