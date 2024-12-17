const baseSchema = (field, rest) => ({
    isEmpty: { errorMessage: `${field} is required`, negated: true, bail: true },
    ...rest
});

const idSchema = (field) => baseSchema(field, {
    isUUID: { errorMessage: `${field} must be valid GUID`, bail: true }
});

const stringSchema = (field) => baseSchema(field, {
    isString: { errorMessage: `${field} must be string`, bail: true }
});

const dateSchema = (field) => baseSchema(field, {
    isISO8601: { errorMessage: `${field} must be vaild date`, bail: true }
});

const intSchema = (field, msg, options) => baseSchema(field, {
    isInt: { errorMessage: `${field} ${msg}`, options, bail: true }
});

const floatSchema = (field, msg, options) => baseSchema(field, {
    isFloat: { errorMessage: `${field} ${msg}`, options, bail: true }
});

const arraySchema = (field, msg, options) => baseSchema(field, {
    isArray: { errorMessage: `${field} ${msg}`, options, bail: true }
});

module.exports = {
    idSchema,
    stringSchema,
    dateSchema,
    intSchema,
    floatSchema,
    arraySchema
};