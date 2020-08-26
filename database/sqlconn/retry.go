package sqlconn

import (
	"errors"
	"github.com/sirupsen/logrus"
	"time"
)

// Stolen from https://github.com/ory/x/blob/e39c10b1eb97a79ca96c7bd7f7da54bf516654fc/resilience/retry.go
// Retry executes a f until no error is returned or failAfter is reached.
func retry(logger *logrus.Logger, maxWait time.Duration, failAfter time.Duration, f func() error) (err error) {
	var lastStart time.Time
	err = errors.New("did not connect")
	loopWait := time.Millisecond * 100
	retryStart := time.Now().UTC()
	for retryStart.Add(failAfter).After(time.Now().UTC()) {
		lastStart = time.Now().UTC()
		if err = f(); err == nil {
			return nil
		}

		if lastStart.Add(maxWait * 2).Before(time.Now().UTC()) {
			retryStart = time.Now().UTC()
		}

		logger.Infof("Retrying in %f seconds...", loopWait.Seconds())
		time.Sleep(loopWait)
		loopWait = loopWait * time.Duration(int64(2))
		if loopWait > maxWait {
			loopWait = maxWait
		}
	}
	return err
}
