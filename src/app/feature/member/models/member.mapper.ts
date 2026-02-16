import { PagedResultUserDto, RoleDto, UserDto } from "src/app/core/api-client/models";
import { Link, PagedUser, Role, User } from "./member.model";
import { mapPagedResult } from "src/app/shared/model/paged-result.model";

export function mapUserDtoToUser(user: UserDto): User {
    return {
        about: user.about,
        activeDonor: user.activeDonor,
        addressSame: user.addressSame,
        blocked: user.blocked,
        createdOn: user.createdOn,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        firstName: user.firstName,
        fullName: user.fullName,
        gender: user.gender,
        id: user.id,
        lastName: user.lastName,
        loginMethod: user.loginMethod,
        middleName: user.middleName,
        permanentAddress: user.permanentAddress,
        picture: user.picture,
        presentAddress: user.presentAddress,
        primaryNumber: user.primaryNumber,
        publicProfile: user.publicProfile,
        roles: user.roles.map(role => ({
            roleCode: role.roleCode,
            description: role.description,
            roleName: role.roleName
        } as Role)),
        secondaryNumber: user.secondaryNumber,
        socialMediaLinks: user.socialMediaLinks.map(link => ({
            linkName: link.linkName,
            linkType: link.linkType,
            linkValue: link.linkValue
        } as Link)),
        status: user.status,
        title: user.title,
        userId: user.userId,
        roleHistory: user.roleHistory,
        roleCodes: user.roles.map(role => role.roleCode),
    }
}


/**
 * Map API PagedResultUserDto to domain PagedUser
 */
export function mapPagedUserDtoToPagedUser(dto: PagedResultUserDto): PagedUser {
    return mapPagedResult(dto, mapUserDtoToUser);
}
