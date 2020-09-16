/* Menu Show/Hide */
$( function() {
    $( "#draggable-JS-00" ).draggable({ snap: true, containment: "body", scroll: false });
    $( "#draggable-JS-01" ).draggable({ snap: true, containment: "body", scroll: false });
    $( "#draggable-JS-02" ).draggable({ snap: true, containment: "body", scroll: false });
  } );

   $(document).ready( function() {
    $("#draggable-JS-00").hide()
    $("#draggable-JS-01").hide()
    $("#draggable-JS-02").hide()
  }); 

  $(document).ready( function() {
      $("#button00").on("click", function() {
          $("#draggable-JS-00").show();
      });
  });
  $(document).ready( function() {
      $("#close00").on("click", function() {
          $("#draggable-JS-00").hide();
      });
  });

  $(document).ready( function() {
      $("#button01").on("click", function() {
          $("#draggable-JS-01").show();
      });
  });
  $(document).ready( function() {
      $("#close01").on("click", function() {
          $("#draggable-JS-01").hide();
      });
  });

  $(document).ready( function() {
      $("#button02").on("click", function() {
          $("#draggable-JS-02").show();
      });
  });
  $(document).ready( function() {
      $("#close02").on("click", function() {
          $("#draggable-JS-02").hide();
      });
  });

  /* Error Messages */
  $(document).ready( function() {
    $("#success").hide()
    $("#warning").hide()
    $("#danger").hide()
  }); 