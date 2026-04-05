class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const getCsrfToken = () => {
    const match = document.cookie.match(new RegExp('(^| )' + 'X-CSRF-TOKEN' + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
}

async function request(path, options = {}) {
    const csrfToken = getCsrfToken()
    const res = await fetch(path, {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.message || res.statusText);
    }
    return res.json();
}

export function fetchProgress() { return request('/api/progress'); }
export function fetchCurrentLevel() { return request('/api/progress/current-level'); }
export function completeLevel(level, userId) {
    return request(`/api/progress/${level}/completed`, {
        method: 'PUT',
        body: JSON.stringify({ user: userId }),
    });
}
export function addBookToLevel(level, bookId) {
    return request(`/api/progress/${level}/add-book`, {
        method: 'PUT',
        body: JSON.stringify({ book: bookId }),
    });
}
export function fetchBooks() { return request('/api/books'); }
export function fetchBook(id) { return request(`/api/books/${id}`); }
export function submitQuiz(data) {
    return request('/api/submissions/add-submission', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export function addReward(owner, type, name) {
    return request('/api/rewards/add-reward', {
        method: 'POST',
        body: JSON.stringify({ owner, type, name }),
    });
}
export function fetchRewards() { return request('/api/rewards'); }
export function fetchStudentProgress(id) { return request(`/api/progress/student/${id}`); }
export function fetchStudentSubmissions(id) { return request(`/api/submissions/student/${id}`); }

export function updateSubmissionStatus(level, userId, status) {
    return request(`/api/progress/${level}/status`, {
        method: 'PUT',
        body: JSON.stringify({ user: userId, status}),
    });
}
export { ApiError };