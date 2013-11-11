(function () {
    describe('Test background.js', function () {
        it('check if makeBaseAuth creates a valid basic auth', function () {
            var result = makeBaseAuth("testuser", "testpass");

            expect(result).toBe("Basic dGVzdHVzZXI6dGVzdHBhc3M=");
        });
        it('check if saveFeedUrl works', function () {
            localStorage = [];
            localStorage['feedUrl'] == '';

            feedMock = {current_user_url: "http://example.com"};

            saveFeedUrl(feedMock);

            expect(localStorage['feedUrl']).toBe("http://example.com");
        });
    });
})();
