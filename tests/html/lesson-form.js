$("#bgrade").click(function() {
    $("#grade").val(2);
    $("#bgrade").prop('disabled', true);
    $("#reg").submit();
});
$("#bresult").click(function() {
    $("#result").val(3);
    $("#bresult").prop('disabled', true);
    $("#reg").submit();
});