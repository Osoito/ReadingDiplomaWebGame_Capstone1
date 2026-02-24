import { Strategy } from 'passport-strategy'

// This file is used to create a custom passport-strategy used to mock local login

class TestStrategy extends Strategy {
    constructor(user = null, info = null) {
        super()
        this.name = 'local-test'
        this._user = user
        this._info = info
    }
    // eslint-disable-next-line no-unused-vars
    authenticate(_req) {
        //console.log(`Authenticating with: ${JSON.stringify(req.body)}`)
        if (this._user) {
            console.log(`TestStrategy: Test user '${this._user.name}' with role: '${this._user.role}' logged in`)
            return this.success(this._user)
        } else {
            console.log('TestStrategy: Authentication failed with info:', JSON.stringify(this._info))
            return this.fail(this._info || { message: 'Authentication failed' }, 401)
        }
    }
}

export default TestStrategy