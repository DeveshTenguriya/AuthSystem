import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;


public class AccountLockedExceptions extends RuntimeException{

    public AccountLockedExceptions(String msg) { super(msg); }
}

// Handled in your @RestControllerAdvice
@ExceptionHandler(AccountLockedExceptions.class)
public ResponseEntity<ErrorResponse> handleLocked(AccountLockedExceptions ex) {
    return ResponseEntity
            .status(HttpStatus.LOCKED)                          // 423
            .body(new ErrorResponse() {
                @Override
                public HttpStatusCode getStatusCode() {
                    return null;
                }

                @Override
                public ProblemDetail getBody() {
                    return null;
                }
            });
}

void main() {
}
