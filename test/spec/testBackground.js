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
        it('check if parsePublicFeed works', function () {
            var eventMock = {
                created_at: "2013-01-01",
                actor_attributes: {gravatar_id: "ah78agf89af"},
                type: "CreateEvent",
                repository: {name: "eventName"},
                actor: "testActor",
                url: "http://example.com"
            };

            var eventList = [];
            eventList.push(eventMock);

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(gravatarId).toBe("ah78agf89af");
            }

            isEventActive = function(name) {
                return true;
            }

            parsePublicFeed(eventList);
        });
    });
})();
