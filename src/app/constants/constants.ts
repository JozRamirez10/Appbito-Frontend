import { HttpStatusCode } from "@angular/common/http";

export const HTTP_HEADERS = {
    AUTHORIZATION: 'Authorization'
} as const;

const HABIT = 'habit';
export const VIEWS = {
    LOGIN: 'login',
    SIGN_IN:'signIn',
    DAILY_HABITS: 'dailyHabits',
    LIST_HABITS: 'listHabits',
    USER: 'user',
    HABIT,
    HABIT_VIEW: `${HABIT}/:view`,
    HABIT_ID_VIEW: `${HABIT}/:id/:view`,
    VERIFY: 'verify'
}

export const PATHS = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    AUTH: '/auth',
    REFRESH: '/refresh',
    VERIFY: '/verify'
} as const;

const API = "/api"
export const API_ROUTES = {
    USERS: `${API}/users`,
    HABITS: `${API}/habits`,
    HABITS_PROGRESS: `${API}/habitsProgress`,
    ME: '/me',
    ME_IMAGE: '/me/image',
    ME_PASSWORD: '/me/password',
    TODAY: '/today',
    BATCH: '/batch',
    HABIT: '/habit',
    RANGE: '/range',
    MONTHLY: '/monthly',
    STREAK: '/streak'
} as const;

export const AUTH = {
    BEARER_PREFIX: 'Bearer ',
    REFRESH_TOKEN_PATH: `${PATHS.AUTH}${PATHS.REFRESH}`,
    TOKEN_EXPIRED: 'JWT expired',
    BEARER: /^Bearer\s+/i,
    TOKEN: 'token',
} as const;

export const MODAL_TITLES = {
    EXPIRED: 'Session expired',
    ERROR_SESSION: 'Session error',
    ERROR_CONNECTION: 'Connection error',
    ERROR_SERVER: 'Server error'
} as const;

export const MODAL_MESSAGES = {
    LOADING: 'Loading...',
    CREATE: 'Successfully created!',
    CREATING_USER: 'Creating user, please wait a moment...',
    EDIT: 'Successfully edited!',
    EDIT_PASSWORD: 'Your password has been successfully changed. Your session will be closed.',
    DELETE: 'It has been deleted.',
    USER_CREATED: 'Please check your email. You will receive a verification message.',
    USER_REMOVED: 'Your user has been deleted successfully. Thank you very much for using Appbito.',
    EXIT: 'Your session has been closed successfully.',

    ERROR_SAVE: 'An error occurred while trying to save. Please try again later.',
    ERROR_DELETE: 'An error occurred while trying to delete. Please try again later.',

    ERROR_USER_LOADING: 'An error ocurred while trying to load user data. Please try again later.',
    ERROR_HABITS_LOADING: 'We could not retrieve your habits at this time.',
    ERROR_HABIT_PROGRESS_SAVE: 'You should include the times you have done it or a quick note',

    EXPIRED: 'The session has expired. Please login again.',
    ERROR_SESSION: 'An error has occurred with the session. Please login again.',
    ERROR_IMAGE: 'Error uploading image.',
    ERROR_CONNECTION: 'Could not establish a connection to the server. Please try again later.',
    ERROR_SERVER: 'An unexpected error occurred on our servers. Please try again.'
} as const;

export const FORM_LOGIN_MESSAGES = {
    REQUIRED_FIELDS: 'Email and password required',
    INVALID_CREDENTIALS: 'Invalid email or password'
} as const;

export const FORMS = {
    AUTH: 'authForm'
} as const;

export const SPINNERS = {
    CRESCENT: "crescent",
    CIRCLES: "circles"
} as const;

export const TOAST = {
    COLOR_SUCCESS: 'success',
    COLOR_ERROR: 'danger',
    COLOR_DEFAULT: 'dark',
    DURATION: 2500,
    TOP_POSITION: 'top',
    CSS_CLASS: 'style-toast'
} as const;

export const ALERTS = {
    DELETE_TITLE: 'Are you sure?',
    DELETE_MESSAGE: "You won't be able to revert this!",
    CONFIRM_DELETE: ' Yes, delete it!',
    ROLE_CONFIRM: 'confirm',
    ROLE_CANCEL: 'cancel',
    CSS_CLASS_CONFIRM: 'alert-button-confirm',
    CSS_CLASS_CANCEL: 'alert-button-cancel'
} as const;

const ZERO = 0;
const ZERO_STRING = '0';
const STATUS_ZERO = ZERO;
export const ERRORS = {
    STATUS_ZERO,
    ERROR_STATUS_INTERCEPTOR: [STATUS_ZERO,
        HttpStatusCode.Unauthorized,
        HttpStatusCode.InternalServerError
    ],
    NO_FILE_SELECTED_ERROR: 'No file selected.',
    INVALID_FILE_ERROR: 'Invalid file type. Only PNG and JPG are allowed.',
    FILE_TOO_LARGE_ERROR: 'File is too large. Maximum size is 2MB.'

} as const;

export const CSS_VARIABLES = {
    SAFE_AREA_TOP: '--ion-safe-area-top',
    SAFE_AREA_BOTTOM: '--ion-safe-area-bottom',
    SAFE_AREA_LEFT: '--ion-safe-area-left',
    SAFE_AREA_RIGHT: '--ion-safe-area-right'
}

export const HABIT_FREQUENCIES = {
    ALL_WEEK: 'All Week',
    WEEKDAYS: 'Weekdays',
    WEEKEND: 'Weekend'
} as const;

export const CALENDAR = {
    WEEKDAYS: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    MONTH_NAMES: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
};

export const MODAL_CONTROLLER = {
    SUCCESS: 'success',
    CANCEL: 'cancel'
}

export const GENERAL = {
    ZERO,
    ZERO_STRING,
    EMPTY_STRING: '',
    RESPONSE: 'response',
    IMAGE: 'image',
    BLOB: 'blob',
    FULL: 'full',
    HYPEN: '-',
    COLON: ':',
    PX: 'px',
    SEPARATE_DATETIME: 'T'
} as const;

export const APP = {
    RETRY: 2,
    HOUR_CHARS: 2,
    MINUTES_CHARS: 2,
    ID: 'id',
    VIEW: 'view',
    OK: 'OK',
    CANCEL: 'Cancel',
    TIME_REFRESH_MS: 500,
    SIZE_KB: 1024,
    MAX_IMAGE_SIZE_MB: 2,
    ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg']
} as const;