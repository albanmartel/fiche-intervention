var today = new Date();
var year = today.getFullYear();
var mois = today.getMonth() + 1 ;
var jour = today.getDate();
var date_aujourdhui = jour + "-" + mois + "-" + year;

$( function() {
    $( ".datepicker" ).datepicker($.datepicker.regional["fr"]);
} );

function updatePrice(){
    var totalProduit = null;
    var nombre = $("#nombre_1").val();
    var prix = $("#prix_1").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_1").val(totalProduit);
      }
    }
    nombre = $("#nombre_2").val();
    prix = $("#prix_2").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_2").val(totalProduit);
      }
    }
    nombre = $("#nombre_3").val();
    prix = $("#prix_3").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_3").val(totalProduit);
      }
    }
    nombre = $("#nombre_4").val();
    prix = $("#prix_4").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_4").val(totalProduit);
      }
    }
    nombre = $("#nombre_5").val();
    prix = $("#prix_5").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_5").val(totalProduit);
      }
    }
    nombre = $("#nombre_6").val();
    prix = $("#prix_6").val();
    if( $.isNumeric(nombre)){
      if ($.isNumeric(prix)){
        totalProduit = nombre*prix;
        $("#somme_6").val(totalProduit);
      }
    }
}

function updateSomme(){
  let somme1 = $("#somme_1").val();
  let somme2 = $("#somme_2").val();
  let somme3 = $("#somme_3").val();
  let somme4 = $("#somme_4").val();
  let somme5 = $("#somme_5").val();
  let somme6 = $("#somme_6").val();
  if( ! $.isNumeric(somme1)){
    $("#somme_1").val(0);
  }
  if( ! $.isNumeric(somme6)){
    $("#somme_2").val(0);
  }
  if( ! $.isNumeric(somme6)){
    $("#somme_3").val(0);
  }
  if( ! $.isNumeric(somme6)){
    $("#somme_4").val(0);
  }
  if( ! $.isNumeric(somme6)){
    $("#somme_5").val(0);
  }
  if( ! $.isNumeric(somme6)){
    $("#somme_6").val(0);
  }
  $("#ht").val(Number(somme1) + Number(somme2) + Number(somme3) + Number(somme4) + Number(somme5) + Number(somme6));
}

function calculateTVA(){
  var ht = $("#ht").val();
  var tva = $("#taux_tva").val();
  var ttc = null;
  if( ! $.isNumeric(tva)){
    $("#taux_tva").val(0);
  } else {
    ttc = (ht*(1 + Number(tva)/100)).toFixed(2);
    let res = ttc.replace(".", " € ")
    $("#ttc").val(res);
    $("#ht").val(ht.replace(".", " € "));
  }
}

$( ".datepicker" ).val(date_aujourdhui)

$(function(){
  $("#phone").mask("+(99) 9 99 99 99 99");
});

$(".prix").on('change', function(){
  updatePrice();
  updateSomme();
  calculateTVA();
});

$(".nombre").on('change', function(){
  updatePrice();
  updateSomme();
  calculateTVA();
});
