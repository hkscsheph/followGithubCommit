function triggerUpload() {
    document.getElementById('image-input').click();
  }
  
  function updateImage(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        document.getElementById('avatar-preview').src = e.target.result;
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }
