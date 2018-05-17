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