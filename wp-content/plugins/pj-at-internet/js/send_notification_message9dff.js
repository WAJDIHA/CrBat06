var atInternetNotif={send_notification_message:function(t){jQuery.ajax({method:"POST",url:rest_object.api_url+"notification/",data:{message:t,guard:rest_object.guard}})}};