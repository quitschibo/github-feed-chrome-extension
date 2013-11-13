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
        it('check if parsePublicFeed works with createEvents', function () {
            var eventMock = {
                created_at: "2013-01-01",
                actor_attributes: {gravatar_id: "ah78agf89af"},
                type: "CreateEvent",
                repository: {name: "repoName"},
                actor: "testActor",
                url: "http://example.com",
                payload: {
                    ref_type: "repository"
                }
            };

            // add mock to param list
            var eventList = [];
            eventList.push(eventMock);

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(title).toBe("New repository repoName created");
                expect(text).toBe("testActor has created repoName! Click to get there!");
                expect(url).toBe("http://example.com");
                expect(gravatarId).toBe("ah78agf89af");
            }

            // all events active
            isEventActive = function() {
                return true;
            }

            // mock localStorage
            localStorage = [];
            localStorage['lastEntry'] == null;

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-01");
        });
    });
})();
