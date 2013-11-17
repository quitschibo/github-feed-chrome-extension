(function () {
    describe('Test background.js', function () {
        /**
         * Reset test environment before run tests
         */
        beforeEach(function() {
            // reset localStorage with helper
            setLocalStorageKey('lastEntry', 0);
            setLocalStorageKey('feedUrl', '');
        });
        it('check if makeBaseAuth creates a valid basic auth', function () {
            var result = makeBaseAuth("testuser", "testpass");

            expect(result).toBe("Basic dGVzdHVzZXI6dGVzdHBhc3M=");
        });
        it('check if saveFeedUrl works', function () {
            feedMock = {current_user_url: "http://example.com"};

            saveFeedUrl(feedMock);

            expect(localStorage['feedUrl']).toBe("http://example.com");
        });
        function createEvent(eventType, createdAt, reponame, actor, url, gravatarId) {
            var eventMock = {
                created_at: createdAt,
                actor_attributes: {gravatar_id: gravatarId},
                type: eventType,
                repository: {name: reponame},
                actor: actor,
                url: url,
                payload: {
                    ref_type: "repository"
                }
            };
            return eventMock;
        }
        it('check if parsePublicFeed works with createEvents', function () {
            // add mock to param list
            var eventList = [];
            eventList.push(createEvent("CreateEvent", "2013-01-01", "repoName", "testActor", "http://example.com", "ah78agf89af"));

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

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-01");
        });
    });
})();
