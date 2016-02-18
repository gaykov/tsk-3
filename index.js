(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToImageData = function (data) {
        var filters = {
            invert: function (r, g, b) {
                return [255 - r, 255 - g, 255 - b];
            },
            grayscale: function (r, g, b) {
                var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                return [v, v, v];
            },
            threshold: function (r, g, b) {
                var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                return [v, v, v];
            }
        };

        var filterName = document.querySelector('.controls__filter').value,
            filterFunction = filters[filterName];

        for(var i = 0, filteredPixel; i < data.length; i += 4) {
          filteredPixel = filterFunction(data[i], data[i + 1], data[i + 2]);

          data[i]     = filteredPixel[0];
          data[i + 1] = filteredPixel[1];
          data[i + 2] = filteredPixel[2];
        }
    };

    var applyFilter = function () {
      var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

      // Apply filter
      applyFilterToImageData(imageData.data);

      // overwrite original image
      canvas.getContext('2d').putImageData(imageData, 0, 0);
    };

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();
