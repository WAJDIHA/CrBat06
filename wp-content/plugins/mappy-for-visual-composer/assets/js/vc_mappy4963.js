!function(a,n,e,o){a(document).ready(function(){a(".vc_mappy-map").each(function(o,p){var i=a(p).attr("data-mapid");if(e.mappyMapParam[i]){var d=e.mappyMapParam[i],r=new n.Mappy.Map(d.id,{clientId:"pagesjaunes",logoControl:!1}),t=n.featureGroup().addTo(r),m=new(n.Icon.extend({options:{iconUrl:d.pin.image,iconSize:d.pin.size||[35,35]}}));a.each(d.addresses,function(a,e){var o={icon:m},p=n.marker(e.latLng,o);p.bindPopup(e.address),t.addLayer(p)}),r.setView(e.mappyMapParam.map_center,d.zoom),r.fitBounds(t.getBounds(),{maxZoom:d.zoom})}})})}(jQuery,L,window);