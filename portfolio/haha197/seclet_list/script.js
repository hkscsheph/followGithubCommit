document
  .getElementById('imageSelector')
  .addEventListener('change', function () {
    var selectedImage = this.value;
    document.getElementById('displayedImage').src = selectedImage;
  });
