$(function() {
	var page = $('#page');
	console.log('setting load function');
	page.load(function() {
		page.contents().find('[name=conType]').val("ft2in");
		page.contents().find('[name=inField]').val("2");
		page.contents().find('[type=button]').click();
	});
	console.log('setting src attr');
	page.attr('src','http://localhost:3131/test.html');
});
